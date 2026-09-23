package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.BookingEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.BookingStatusEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.BookingRepository;
import com.hotel.booking.infrastructure.config.vnpay.VNPayConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
@Tag(name = "Payment Operations", description = "Tích hợp cổng thanh toán VNPay Sandbox")
public class PaymentController {

    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;

    public PaymentController(VNPayConfig vnPayConfig, BookingRepository bookingRepository) {
        this.vnPayConfig = vnPayConfig;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/create-payment")
    @Operation(summary = "Tạo URL thanh toán VNPay cho đơn đặt phòng")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestParam UUID bookingId,
            HttpServletRequest request) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng: " + bookingId));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isStaff = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST")
        );
        String currentUsername = auth.getName();
        if (!isStaff && (booking.getUser() == null || !booking.getUser().getUsername().equals(currentUsername))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = booking.getId().toString();
        
        String vnp_IpAddr = request.getHeader("X-Forwarded-For");
        if (vnp_IpAddr == null || vnp_IpAddr.isBlank() || "unknown".equalsIgnoreCase(vnp_IpAddr)) {
            vnp_IpAddr = request.getRemoteAddr();
        }
        if (vnp_IpAddr != null && vnp_IpAddr.contains(",")) {
            vnp_IpAddr = vnp_IpAddr.split(",")[0].trim();
        }
        if (vnp_IpAddr == null || vnp_IpAddr.isBlank()) {
            vnp_IpAddr = "127.0.0.1";
        }

        String vnp_TmnCode = vnPayConfig.getTmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        
        // Amount must be multiplied by 100
        long amount = booking.getEstimatedPrice().longValue() * 100;
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don dat phong: " + booking.getId());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-callback")
    @Operation(summary = "VNPay Callback IPN nhận kết quả thanh toán")
    public void paymentCallback(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {
        
        String frontendUrl = vnPayConfig.getFrontendUrl();
        String vnp_SecureHash = params.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String signValue = VNPayConfig.hashAllFields(fields, vnPayConfig.getHashSecret());
        UUID bookingId = UUID.fromString(params.get("vnp_TxnRef"));
        
        if (signValue.equals(vnp_SecureHash)) {
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                // Success
                BookingEntity booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {
                    booking.setStatus(BookingStatusEntity.CONFIRMED);
                    bookingRepository.save(booking);
                }
                response.sendRedirect(frontendUrl + "/payment-success?status=success&bookingId=" + bookingId);
            } else {
                // Failure
                response.sendRedirect(frontendUrl + "/payment-success?status=fail&bookingId=" + bookingId);
            }
        } else {
            response.sendRedirect(frontendUrl + "/payment-success?status=invalid_signature");
        }
    }
}