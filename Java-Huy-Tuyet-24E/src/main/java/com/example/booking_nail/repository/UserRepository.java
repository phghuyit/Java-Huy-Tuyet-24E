package com.example.booking_nail.repository;

import com.example.booking_nail.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByAvatarUrl(String avatarUrl);
    Optional<User> findByEmailIgnoreCase(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.role.code = 'STAFF' and u.status = 'ACTIVE' order by u.id asc")
    List<User> findActiveStaffForUpdate();

    @Query("select count(u) from User u where u.role.code = 'ADMIN' and u.status = 'ACTIVE'")
    long countActiveAdmins();

    List<User> findByRoleIsNull();

    @Query("select u from User u where u.role.code = :roleCode")
    List<User> findByRoleCode(@Param("roleCode") String roleCode);

    @Query("select u from User u where u.role.code = :roleCode and u.status = :status")
    List<User> findByRoleCodeAndStatus(@Param("roleCode") String roleCode, @Param("status") String status);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByPhoneAndIdNot(String phone, Long id);
}
