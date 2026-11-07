package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.AppointmentServices;
import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.AppointmentServicesRepository;
import com.example.booking_nail.repository.AppointmentsRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ServiceDetailDataInitializerTests {

    private AppointmentsRepository appointmentsRepository;
    private AppointmentServicesRepository appointmentServicesRepository;
    private NailServiceRepository nailServiceRepository;
    private ServiceDetailDataInitializer initializer;

    @BeforeEach
    void setUp() {
        appointmentsRepository = mock(AppointmentsRepository.class);
        appointmentServicesRepository = mock(AppointmentServicesRepository.class);
        nailServiceRepository = mock(NailServiceRepository.class);

        initializer = new ServiceDetailDataInitializer(
                appointmentsRepository,
                appointmentServicesRepository,
                nailServiceRepository
        );
    }

    @Test
    void seedsServiceDetailsWhenAppointmentHasNone() {
        Appointments appt = new Appointments();
        appt.setId(1L);
        appt.setBookingCode("APPT-TEST-001");

        when(appointmentsRepository.findAll()).thenReturn(List.of(appt));

        NailService service1 = new NailService(10L, 1L, "Sơn gel", 150000.0, 45, "Mô tả", "/placeholder.svg", "ACTIVE");
        NailService service2 = new NailService(11L, 1L, "Chăm sóc móng tay", 100000.0, 30, "Mô tả", "/placeholder.svg", "ACTIVE");
        when(nailServiceRepository.findAll()).thenReturn(List.of(service1, service2));

        when(appointmentServicesRepository.findByAppointmentId(1L)).thenReturn(Collections.emptyList());

        initializer.run();

        verify(appointmentServicesRepository, atLeastOnce()).save(any(AppointmentServices.class));
    }

    @Test
    void skipsWhenAppointmentAlreadyHasDetails() {
        Appointments appt = new Appointments();
        appt.setId(1L);

        when(appointmentsRepository.findAll()).thenReturn(List.of(appt));
        when(nailServiceRepository.findAll()).thenReturn(List.of(new NailService(10L, 1L, "Sơn gel", 150000.0, 45, "Mô tả", null, "ACTIVE")));

        AppointmentServices existing = new AppointmentServices(100L, 1L, 10L, java.math.BigDecimal.valueOf(150000));
        when(appointmentServicesRepository.findByAppointmentId(1L)).thenReturn(List.of(existing));

        initializer.run();

        verify(appointmentServicesRepository, never()).save(any());
    }

    @Test
    void skipsWhenAppointmentsOrServicesEmpty() {
        when(appointmentsRepository.findAll()).thenReturn(Collections.emptyList());
        when(nailServiceRepository.findAll()).thenReturn(Collections.emptyList());

        initializer.run();

        verify(appointmentServicesRepository, never()).save(any());
    }
}
