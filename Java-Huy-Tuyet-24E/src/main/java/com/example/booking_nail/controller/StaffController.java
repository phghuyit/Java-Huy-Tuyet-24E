package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.StaffRequest;
import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.dto.response.StaffResponse;
import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.service.RoleService;
import com.example.booking_nail.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {
    private final UserService userService;
    private final RoleService roleService;

    @GetMapping
    public List<StaffResponse> getAllStaff(@RequestParam(required = false) String status) {
        List<User> staffUsers = userService.getUsersByRole("STAFF");
        if (status != null && !status.isBlank()) {
            staffUsers = staffUsers.stream()
                    .filter(u -> status.equalsIgnoreCase(u.getStatus()))
                    .toList();
        }
        return staffUsers.stream().map(StaffResponse::from).toList();
    }

    @GetMapping("/{id}")
    public StaffResponse getStaffById(@PathVariable Long id) {
        User user = userService.getUser(id);
        if (user.getRole() == null || !"STAFF".equals(user.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên");
        }
        return StaffResponse.from(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse createStaff(@RequestBody StaffRequest request) {
        Role staffRole = roleService.getRoles().stream()
                .filter(r -> "STAFF".equals(r.getCode()))
                .findFirst()
                .orElse(null);

        UserCreationRequest userRequest = new UserCreationRequest();
        String name = request.getName() != null && !request.getName().isBlank()
                ? request.getName() : request.getFullName();
        userRequest.setFullName(name);
        userRequest.setEmail(request.getEmail());
        userRequest.setPhone(request.getPhone());
        userRequest.setPassword(request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : null);
        userRequest.setStatus(request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus() : "ACTIVE");
        userRequest.setAvatarUrl(request.getAvatarUrl());
        if (staffRole != null) {
            userRequest.setRoleId(staffRole.getId());
        }
        String resolvedJobTitle = request.getJobTitle() != null && !request.getJobTitle().isBlank()
                ? request.getJobTitle() : request.getRole();
        userRequest.setJobTitle(resolvedJobTitle);
        userRequest.setBio(request.getBio());
        userRequest.setExperienceYears(request.getExperienceYears());

        User created = userService.createUser(userRequest);
        return StaffResponse.from(created);
    }

    @PutMapping("/{id}")
    public StaffResponse updateStaff(@PathVariable Long id, @RequestBody StaffRequest request) {
        User user = userService.getUser(id);
        if (user.getRole() == null || !"STAFF".equals(user.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên");
        }

        UserUpdateRequest userRequest = new UserUpdateRequest();
        String name = request.getName() != null && !request.getName().isBlank()
                ? request.getName() : request.getFullName();
        userRequest.setFullName(name != null ? name : user.getFullName());
        userRequest.setEmail(request.getEmail() != null ? request.getEmail() : user.getEmail());
        userRequest.setPhone(request.getPhone() != null ? request.getPhone() : user.getPhone());
        userRequest.setStatus(request.getStatus() != null ? request.getStatus() : user.getStatus());
        userRequest.setAvatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : user.getAvatarUrl());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            userRequest.setPassword(request.getPassword());
        }
        if (user.getRole() != null) {
            userRequest.setRoleId(user.getRole().getId());
        }
        String resolvedJobTitle = request.getJobTitle() != null && !request.getJobTitle().isBlank()
                ? request.getJobTitle() : request.getRole();
        userRequest.setJobTitle(resolvedJobTitle);
        userRequest.setBio(request.getBio());
        userRequest.setExperienceYears(request.getExperienceYears());

        User updated = userService.updateUser(id, userRequest);
        return StaffResponse.from(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStaff(@PathVariable Long id) {
        User user = userService.getUser(id);
        if (user.getRole() == null || !"STAFF".equals(user.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên");
        }
        userService.deleteUser(id);
    }
}
