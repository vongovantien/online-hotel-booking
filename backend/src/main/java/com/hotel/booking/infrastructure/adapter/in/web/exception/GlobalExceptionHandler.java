package com.hotel.booking.infrastructure.adapter.in.web.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------------------------
    // Validation errors (@Valid / JSR 380 Beans Validation)
    // -------------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (first, second) -> first // Keep first error if duplicate
                ));

        ValidationErrorResponse body = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                fieldErrors,
                LocalDateTime.now().toString()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // -------------------------------------------------------------------------
    // Duplicate Resource Exception
    // -------------------------------------------------------------------------

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(DuplicateResourceException ex) {
        return error(HttpStatus.BAD_REQUEST, "DUPLICATE_RESOURCE", ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Application-level exceptions
    // -------------------------------------------------------------------------

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        return error(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATE", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ex.printStackTrace();
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ResponseEntity<ErrorResponse> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), code, message, LocalDateTime.now()));
    }

    // -------------------------------------------------------------------------
    // Response models
    // -------------------------------------------------------------------------

    @Getter
    @AllArgsConstructor
    @Schema(description = "Standard error response")
    public static class ErrorResponse {
        @Schema(example = "404")
        private final int statusCode;
        @Schema(example = "RESOURCE_NOT_FOUND")
        private final String code;
        @Schema(example = "Resource not found")
        private final String message;
        @Schema(example = "2024-01-01T12:00:00")
        private final LocalDateTime timestamp;
    }

    @Getter
    @AllArgsConstructor
    @Schema(description = "Validation error response with per-field details")
    public static class ValidationErrorResponse {
        private final int statusCode;
        private final String message;
        @Schema(description = "Map of field name → error message")
        private final Map<String, String> errors;
        private final String timestamp;
    }
}
