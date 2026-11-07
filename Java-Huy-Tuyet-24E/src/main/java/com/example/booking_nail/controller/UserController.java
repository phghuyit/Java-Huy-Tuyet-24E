package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.dto.response.UserResponse;
import com.example.booking_nail.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody UserCreationRequest request) {
        return UserResponse.from(userService.createUser(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUserWithAvatar(@RequestPart("user") UserCreationRequest request,
                                            @RequestPart("avatar") MultipartFile avatar) {
        return UserResponse.from(userService.createUser(request, avatar));
    }

    @GetMapping
    public List<UserResponse> getAllUser(@RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            return userService.getUsersByRole(role).stream().map(UserResponse::from).toList();
        }
        return userService.getUsers().stream().map(UserResponse::from).toList();
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return UserResponse.from(userService.getUser(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public UserResponse updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return UserResponse.from(userService.updateUser(id, request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse updateUserWithAvatar(@PathVariable Long id, @RequestPart("user") UserUpdateRequest request,
                                            @RequestPart("avatar") MultipartFile avatar) {
        return UserResponse.from(userService.updateUser(id, request, avatar));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
