package com.hotel.booking.domain.exception;

public class GuestLimitExceededException extends RuntimeException {
    public GuestLimitExceededException(String message) { super(message); }
}
