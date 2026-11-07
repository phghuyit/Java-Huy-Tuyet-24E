package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTests {
    private UserRepository repository;
    private UserService service;

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        service = new UserService(repository, mock(RoleService.class), mock(PasswordEncoder.class), mock(AvatarService.class));
    }

    private UserCreationRequest validRequest() {
        UserCreationRequest request = new UserCreationRequest();
        request.setFullName("  Nguyễn Minh Anh  ");
        request.setEmail("  MINHANH@EXAMPLE.COM  ");
        request.setPhone("0910000001");
        return request;
    }

    @Test
    void duplicateEmailReturnsConflictWithoutSaving() {
        when(repository.existsByEmail("minhanh@example.com")).thenReturn(true);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.createUser(validRequest()));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any());
    }

    @Test
    void duplicatePhoneReturnsConflictWithoutSaving() {
        when(repository.existsByPhone("0910000001")).thenReturn(true);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.createUser(validRequest()));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any());
    }

    @Test
    void invalidPhoneReturnsBadRequest() {
        UserCreationRequest request = validRequest();
        request.setPhone("abc");
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> service.createUser(request)).getStatusCode());
    }

    @Test
    void storesNormalizedFieldsAndTimestamps() {
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User user = service.createUser(validRequest());
        assertEquals("Nguyễn Minh Anh", user.getFullName());
        assertEquals("minhanh@example.com", user.getEmail());
        assertEquals("ACTIVE", user.getStatus());
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void updateChecksNormalizedEmailAgainstOtherUsers() {
        when(repository.findById(5L)).thenReturn(Optional.of(new User()));
        when(repository.existsByEmailAndIdNot("minhanh@example.com", 5L)).thenReturn(true);
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFullName("Minh Anh");
        request.setEmail(" MINHANH@EXAMPLE.COM ");
        request.setPhone("0910000001");
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class,
                () -> service.updateUser(5L, request)).getStatusCode());
        verify(repository, never()).save(any());
    }
}
