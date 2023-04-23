using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace PersonalizedCardGame.Models
{
    public partial class DBCardGameContext : IdentityDbContext<AppUser>
    {
        private readonly DbContextOptions<DBCardGameContext> _options;

        public DBCardGameContext()
        {
        }

        public DBCardGameContext(DbContextOptions<DBCardGameContext> options)
            : base(options)
        {
            _options = options;
        }

        public virtual DbSet<ActionType> ActionType { get; set; }
        public virtual DbSet<ExceptionLog> ExceptionLog { get; set; }
        public virtual DbSet<GameHashTemp> GameHashTemp { get; set; }
        public virtual DbSet<GameLog> GameLog { get; set; }
        public virtual DbSet<LogEntryType> LogEntryType { get; set; }
        public virtual DbSet<Player> Player { get; set; }
        public virtual DbSet<PlayerAction> PlayerAction { get; set; }
        public virtual DbSet<PlayerCard> PlayerCard { get; set; }
        public virtual DbSet<GameInvite> GameInvite { get; set; }

        public virtual DbSet<RecurringGames> RecurringGames { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                //optionsBuilder.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Integrated Security=true;Database=DBCardGame;");
                optionsBuilder.UseSqlServer("Data Source=SQL5100.site4now.net;Initial Catalog=DB_A6A4B3_Devdb;User Id=DB_A6A4B3_Devdb_admin;Password=Dev13021");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ActionType>(entity =>
            {
                entity.Property(e => e.Code).HasMaxLength(15);

                entity.Property(e => e.Description).HasMaxLength(100);
            });

            modelBuilder.Entity<ExceptionLog>(entity =>
            {
                entity.Property(e => e.ConnectionId).HasMaxLength(100);

                entity.Property(e => e.Created).HasColumnType("datetime");

                entity.Property(e => e.GameCode).HasMaxLength(100);

                entity.Property(e => e.Modified).HasColumnType("datetime");

                entity.Property(e => e.PlayerUniqueId).HasMaxLength(50);
            });

            modelBuilder.Entity<GameHashTemp>(entity =>
            {
                entity.Property(e => e.Created).HasColumnType("datetime");

                entity.Property(e => e.GameCode).HasMaxLength(25);

                entity.Property(e => e.Modified).HasColumnType("datetime");
            });

            modelBuilder.Entity<GameLog>(entity =>
            {
                entity.Property(e => e.Action).HasMaxLength(250);

                entity.Property(e => e.Created).HasColumnType("datetime");
            });

            modelBuilder.Entity<LogEntryType>(entity =>
            {
                entity.Property(e => e.LogEntryTitle)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Player>(entity =>
            {
                entity.Property(e => e.Created).HasColumnType("datetime");

                entity.Property(e => e.GameCode).HasMaxLength(25);

                entity.Property(e => e.LastActionTime).HasColumnType("datetime");

                entity.Property(e => e.Modified).HasColumnType("datetime");

                entity.Property(e => e.PlayerUniqueId).HasMaxLength(150);

                entity.Property(e => e.SignalRconnectionId)
                    .HasColumnName("SignalRConnectionId")
                    .HasMaxLength(150);

                entity.Property(e => e.UserName).HasMaxLength(100);
            });

            modelBuilder.Entity<PlayerAction>(entity =>
            {
                entity.Property(e => e.AfterStatus).HasMaxLength(20);

                entity.Property(e => e.BeforeStatus).HasMaxLength(20);

                entity.Property(e => e.Created).HasColumnType("datetime");

                entity.Property(e => e.Modified).HasColumnType("datetime");
            });

            modelBuilder.Entity<PlayerCard>(entity =>
            {
                entity.Property(e => e.Created).HasColumnType("datetime");

                entity.Property(e => e.Modified).HasColumnType("datetime");
            });
        }
    }
}
