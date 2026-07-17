package com.hotel.booking.domain.model;

import java.util.UUID;

/**
 * Người dùng hệ thống với vai trò RBAC.
 * CUSTOMER / RECEPTIONIST / ADMIN — phân quyền theo spec.
 */
public class User {

    private final UUID id;
    private final String username;
    private final String passwordHash;
    private final String fullName;
    private final UserRole role;
    private final boolean active;

    private User(Builder b) {
        this.id = b.id;
        this.username = b.username;
        this.passwordHash = b.passwordHash;
        this.fullName = b.fullName;
        this.role = b.role;
        this.active = b.active;
    }

    public boolean hasRole(UserRole required) { return this.role == required; }
    public boolean isAdmin()        { return this.role == UserRole.ADMIN; }
    public boolean isReceptionist() { return this.role == UserRole.RECEPTIONIST; }

    public UUID getId()             { return id; }
    public String getUsername()     { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName()     { return fullName; }
    public UserRole getRole()       { return role; }
    public boolean isActive()       { return active; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String username;
        private String passwordHash;
        private String fullName;
        private UserRole role;
        private boolean active = true;

        public Builder id(UUID v)             { this.id = v; return this; }
        public Builder username(String v)     { this.username = v; return this; }
        public Builder passwordHash(String v) { this.passwordHash = v; return this; }
        public Builder fullName(String v)     { this.fullName = v; return this; }
        public Builder role(UserRole v)       { this.role = v; return this; }
        public Builder active(boolean v)      { this.active = v; return this; }
        public User build()                   { return new User(this); }
    }
}
