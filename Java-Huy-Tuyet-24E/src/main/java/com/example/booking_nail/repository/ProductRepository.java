package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
    boolean existsBySkuIgnoreCase(String sku);
    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    boolean existsByCategoryId(Long categoryId);
    List<Product> findByCategoryId(Long categoryId);

    @Query(value = "SELECT * FROM products WHERE status = 'DELETED'", nativeQuery = true)
    List<Product> findDeletedProducts();

    @Modifying
    @Query(value = "UPDATE products SET status = 'ACTIVE' WHERE id = :id", nativeQuery = true)
    void restoreProduct(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM products WHERE id = :id", nativeQuery = true)
    void purgeProduct(@Param("id") Long id);
}
