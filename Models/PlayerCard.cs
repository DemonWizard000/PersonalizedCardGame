using System;
using System.Collections.Generic;

namespace PersonalizedCardGame.Models
{
    public partial class PlayerCard
    {
        public long Id { get; set; }
        public long? PlayerId { get; set; }
        public long? GameId { get; set; }
        public long? PlayerCardHash { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Modified { get; set; }
    }
}
