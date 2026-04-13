package com.mediconnect.repository;

import com.mediconnect.entity.DoctorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query("""
        SELECT d FROM DoctorProfile d
        JOIN d.user u
        JOIN d.specialty s
        WHERE d.isVerified = true
        AND (:specialtyId IS NULL OR s.id = :specialtyId)
        AND (:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%')))
        AND (:name IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
             OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
        ORDER BY d.averageRating DESC
        """)
    Page<DoctorProfile> searchDoctors(
            @Param("specialtyId") Long specialtyId,
            @Param("city") String city,
            @Param("name") String name,
            Pageable pageable
    );

    Page<DoctorProfile> findByIsVerifiedFalse(Pageable pageable);

    long countByIsVerifiedFalse();
}
