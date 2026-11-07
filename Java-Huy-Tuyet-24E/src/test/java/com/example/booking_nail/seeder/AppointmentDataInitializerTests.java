package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.AppointmentServicesRepository;
import com.example.booking_nail.repository.AppointmentStatusHistoryRepository;
import com.example.booking_nail.repository.AppointmentsRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AppointmentDataInitializerTests {

    private AppointmentsRepository appointmentsRepository;
    private AppointmentServicesRepository appointmentServicesRepository;
    private AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;
    private UserRepository userRepository;
    private NailServiceRepository nailServiceRepository;
    private AppointmentDataInitializer initializer;

    @BeforeEach
    void setUp() {
        appointmentsRepository = mock(AppointmentsRepository.class);
        appointmentServicesRepository = mock(AppointmentServicesRepository.class);
        appointmentStatusHistoryRepository = mock(AppointmentStatusHistoryRepository.class);
        userRepository = mock(UserRepository.class);
        nailServiceRepository = mock(NailServiceRepository.class);

        initializer = new AppointmentDataInitializer(
                appointmentsRepository,
                appointmentServicesRepository,
                appointmentStatusHistoryRepository,
                userRepository,
                nailServiceRepository
        );
    }

    @Test
    void seedsAppointmentsWhenDatabaseIsEmpty() {
        when(appointmentsRepository.count()).thenReturn(0L);

        User customer = new User();
        customer.setId(1L);
        customer.setFullName("Nguyễn Minh Anh");

        User staff = new User();
        staff.setId(2L);
        staff.setFullName("Trần Thảo Linh");

        when(userRepository.findAll()).thenReturn(List.of(customer, staff));

        NailService service1 = new NailService();
        service1.setId(10L);
        service1.setName("Sơn gel");
        service1.setPrice(150000.0);

        NailService service2 = new NailService();
        service2.setId(11L);
        service2.setName("Sơn thường");
        service2.setPrice(80000.0);

        when(nailServiceRepository.findAll()).thenReturn(List.of(service1, service2));
        when(appointmentsRepository.save(any(Appointments.class))).thenAnswer(invocation -> {
            Appointments appt = invocation.getArgument(0);
            appt.setId(100L);
            return appt;
        });

        initializer.run();

        verify(appointmentsRepository, times(2)).save(any(Appointments.class));
        verify(appointmentServicesRepository, times(2)).save(any());
        verify(appointmentStatusHistoryRepository, times(2)).save(any());
    }

    @Test
    void doesNotSeedWhenAppointmentsAlreadyExist() {
        when(appointmentsRepository.count()).thenReturn(5L);

        initializer.run();

        verify(appointmentsRepository, never()).save(any());
        verify(appointmentServicesRepository, never()).save(any());
        verify(appointmentStatusHistoryRepository, never()).save(any());
    }

    @Test
    void skipsWhenUsersOrServicesEmpty() {
        when(appointmentsRepository.count()).thenReturn(0L);
        when(userRepository.findAll()).thenReturn(List.of());
        when(nailServiceRepository.findAll()).thenReturn(List.of());

        initializer.run();

        verify(appointmentsRepository, never()).save(any());
    }
}
