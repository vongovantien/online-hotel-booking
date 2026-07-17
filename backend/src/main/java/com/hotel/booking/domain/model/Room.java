package com.hotel.booking.domain.model;

import java.util.UUID;

/**
 * Phòng khách sạn — BM3.
 * Trạng thái chỉ được thay đổi qua domain methods.
 */
public class Room {

    private final UUID id;
    private final String roomNumber;
    private final RoomType roomType;
    private RoomStatus status;
    private final String note;

    private Room(Builder b) {
        this.id = b.id;
        this.roomNumber = b.roomNumber;
        this.roomType = b.roomType;
        this.status = b.status;
        this.note = b.note;
    }

    // --- Domain behavior ---

    public void rent() {
        if (this.status != RoomStatus.AVAILABLE)
            throw new IllegalStateException("Phòng " + roomNumber + " không ở trạng thái trống.");
        this.status = RoomStatus.RENTED;
    }

    public void release() {
        this.status = RoomStatus.AVAILABLE;
    }

    public boolean isAvailable() { return this.status == RoomStatus.AVAILABLE; }
    public boolean isRented()    { return this.status == RoomStatus.RENTED; }

    // --- Getters ---
    public UUID getId()           { return id; }
    public String getRoomNumber() { return roomNumber; }
    public RoomType getRoomType() { return roomType; }
    public RoomStatus getStatus() { return status; }
    public String getNote()       { return note; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String roomNumber;
        private RoomType roomType;
        private RoomStatus status;
        private String note;

        public Builder id(UUID id)               { this.id = id; return this; }
        public Builder roomNumber(String v)      { this.roomNumber = v; return this; }
        public Builder roomType(RoomType v)      { this.roomType = v; return this; }
        public Builder status(RoomStatus v)      { this.status = v; return this; }
        public Builder note(String v)            { this.note = v; return this; }
        public Room build()                      { return new Room(this); }
    }
}
