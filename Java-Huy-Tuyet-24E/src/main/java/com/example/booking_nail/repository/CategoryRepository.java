package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    List<Category> findByTypeIgnoreCase(String type);

    @Query(value = "SELECT * FROM categories WHERE status = 'DELETED'", nativeQuery = true)
    List<Category> findDeletedCategories();

    @Modifying
    @Query(value = "UPDATE categories SET status = 'ACTIVE' WHERE id = :id", nativeQuery = true)
    void restoreCategory(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM categories WHERE id = :id", nativeQuery = true)
    void purgeCategory(@Param("id") Long id);
}
