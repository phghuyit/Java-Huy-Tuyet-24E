package com.example.booking_nail.dto.response;

import com.example.booking_nail.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private Long id;
    private String name;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String jobTitle;
    private String roleCode;
    private String status;
    private boolean active;
    private String avatarUrl;
    private Integer experienceYears;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StaffResponse from(User user) {
        StaffResponse response = new StaffResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        String resolvedTitle = user.getJobTitle() != null && !user.getJobTitle().isBlank()
                ? user.getJobTitle()
                : (user.getRole() != null ? user.getRole().getName() : "Chuyên viên");
        response.setRole(resolvedTitle);
        response.setJobTitle(user.getJobTitle());
        response.setRoleCode(user.getRole() != null ? user.getRole().getCode() : "STAFF");
        response.setStatus(user.getStatus());
        response.setActive("ACTIVE".equalsIgnoreCase(user.getStatus()));
        response.setAvatarUrl(user.getAvatarUrl());
        response.setExperienceYears(user.getExperienceYears() != null ? user.getExperienceYears() : 3);
        response.setBio(user.getBio() != null && !user.getBio().isBlank() ? user.getBio() : "Chuyên viên giàu kinh nghiệm tại salon.");
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
