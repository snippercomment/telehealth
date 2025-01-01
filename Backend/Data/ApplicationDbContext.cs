
using Backend.Controllers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using System.Text.Json;
using DbContext = Microsoft.EntityFrameworkCore.DbContext;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<ConsultationMessage> ConsultationMessages { get; set; }
        public DbSet<AppointmentHistory> AppointmentHistories { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentDetail> PaymentDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình quan hệ với User và Doctor
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.User)
                .WithMany(u => u.Appointments)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ PaymentDetail -> Payment
            modelBuilder.Entity<PaymentDetail>()
                .HasOne(pd => pd.Payment)
                .WithMany(p => p.PaymentDetails)
                .HasForeignKey(pd => pd.PaymentID)
                .OnDelete(DeleteBehavior.NoAction); // Tránh vòng lặp cascade

            // Quan hệ PaymentDetail -> Appointment
            modelBuilder.Entity<PaymentDetail>()
                .HasOne(pd => pd.Appointment)
                .WithMany(a => a.PaymentDetails)
                .HasForeignKey(pd => pd.AppointmentID)
                .OnDelete(DeleteBehavior.NoAction); // Tránh vòng lặp cascade

            // Quan hệ Appointment -> Payment
         


            // Cấu hình độ chính xác cho TotalFee trong Appointment
            modelBuilder.Entity<Appointment>()
                .Property(a => a.TotalFee)
                .HasColumnType("decimal(18,2)");

            // Cấu hình độ chính xác cho Amount trong PaymentDetail
            modelBuilder.Entity<PaymentDetail>()
                .Property(pd => pd.Amount)
                .HasColumnType("decimal(18,2)");
        }
    }

 }

