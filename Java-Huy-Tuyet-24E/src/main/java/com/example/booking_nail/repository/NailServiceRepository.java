package com.example.booking_nail.repository;

import com.example.booking_nail.entity.NailService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NailServiceRepository extends JpaRepository<NailService, Long> {
    boolean existsByCategoryId(Long categoryId);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    Optional<NailService> findByNameIgnoreCase(String name);

    Optional<NailService> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query(value = "SELECT * FROM nail_service WHERE status = 'DELETED'", nativeQuery = true)
    List<NailService> findDeletedServices();

    @Modifying
    @Query(value = "UPDATE nail_service SET status = 'ACTIVE' WHERE id = :id", nativeQuery = true)
    void restoreService(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM nail_service WHERE id = :id", nativeQuery = true)
    void purgeService(@Param("id") Long id);
}
