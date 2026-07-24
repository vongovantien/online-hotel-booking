package com.hotel.booking.usecase.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;

    public EmailService(org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public void sendEmail(String to, String subject, String body) {
        log.info("📧 Chuẩn bị gửi email tới: {}", to);
        log.info("📧 Tiêu đề: {}", subject);
        log.info("📧 Nội dung:\n{}", body);

        if (mailSender == null) {
            log.warn("⚠️ SMTP server (JavaMailSender) chưa được cấu hình. Chỉ ghi nhận email ra console log.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("no-reply@hotelify.vn");
            mailSender.send(message);
            log.info("📧 Gửi email thành công tới {}", to);
        } catch (Exception e) {
            log.warn("⚠️ Không thể kết nối tới SMTP Server để gửi email thực tế. Chi tiết: {}. Email đã được ghi nhận trong log hệ thống.", e.getMessage());
        }
    }
}
