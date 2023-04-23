using System;
using System.Collections.Generic;

namespace PersonalizedCardGame.Models
{
    public partial class GameLog
    {
        public long Id { get; set; }
        public long? GameId { get; set; }
        public long? PlayerId { get; set; }
        public string Action { get; set; }
        public DateTime? Created { get; set; }
        public long? Amount { get; set; }
    }
}
