package com.hotel.booking.domain.exception;

public class RentalNotFoundException extends RuntimeException {
    public RentalNotFoundException(String message) { super(message); }
}
