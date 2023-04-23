using System;
using System.Collections.Generic;

namespace PersonalizedCardGame.Models
{
    public partial class PlayerAction
    {
        public long Id { get; set; }
        public long? GameId { get; set; }
        public long? PlayerId { get; set; }
        public int? Action { get; set; }
        public long? Amount { get; set; }
        public string BeforeStatus { get; set; }
        public string AfterStatus { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Modified { get; set; }
        public int? Round { get; set; }
        public int? Hand { get; set; }
    }
}
