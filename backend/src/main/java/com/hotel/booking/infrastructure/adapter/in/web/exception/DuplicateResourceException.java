package com.hotel.booking.infrastructure.adapter.in.web.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
