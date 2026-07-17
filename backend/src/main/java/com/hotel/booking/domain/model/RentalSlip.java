package com.hotel.booking.domain.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Phiếu thuê phòng — BM2.
 * Aggregate root cho quy trình Check-in.
 */
public class RentalSlip {

    private static final int MAX_GUESTS = 3; // default, overridden by SystemParameter

    private final UUID id;
    private final Room room;
    private final LocalDateTime startDate;
    private final LocalDateTime createdAt;
    private final List<Guest> guests;
    private RentalStatus status;

    private RentalSlip(Builder b) {
        this.id = b.id;
        this.room = b.room;
        this.startDate = b.startDate;
        this.createdAt = b.createdAt;
        this.guests = b.guests != null ? Collections.unmodifiableList(b.guests) : Collections.emptyList();
        this.status = b.status;
    }

    // --- Domain behavior ---

    /**
     * QĐ2: Validate số lượng khách trước khi tạo phiếu.
     * maxGuests đọc từ SystemParameter (QĐ6).
     */
    public static void validateGuestCount(List<Guest> guests, int maxGuests) {
        if (guests == null || guests.isEmpty())
            throw new IllegalArgumentException("Danh sách khách không được để trống.");
        if (guests.size() > maxGuests)
            throw new IllegalArgumentException(
                "Số lượng khách vượt quá quy định: tối đa " + maxGuests + " khách/phòng.");
    }

    public void complete() {
        if (this.status != RentalStatus.ACTIVE)
            throw new IllegalStateException("Phiếu thuê không ở trạng thái ACTIVE.");
        this.status = RentalStatus.COMPLETED;
    }

    public boolean isActive()      { return this.status == RentalStatus.ACTIVE; }
    public int getGuestCount()     { return guests.size(); }
    public boolean hasForeignGuest() {
        return guests.stream().anyMatch(Guest::isForeign);
    }

    // --- Getters ---
    public UUID getId()                { return id; }
    public Room getRoom()              { return room; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Guest> getGuests()     { return guests; }
    public RentalStatus getStatus()    { return status; }

    public static Builder builder()    { return new Builder(); }

    public static class Builder {
        private UUID id;
        private Room room;
        private LocalDateTime startDate;
        private LocalDateTime createdAt;
        private List<Guest> guests;
        private RentalStatus status;

        public Builder id(UUID id)               { this.id = id; return this; }
        public Builder room(Room v)              { this.room = v; return this; }
        public Builder startDate(LocalDateTime v){ this.startDate = v; return this; }
        public Builder createdAt(LocalDateTime v){ this.createdAt = v; return this; }
        public Builder guests(List<Guest> v)     { this.guests = v; return this; }
        public Builder status(RentalStatus v)    { this.status = v; return this; }
        public RentalSlip build()                { return new RentalSlip(this); }
    }
}
