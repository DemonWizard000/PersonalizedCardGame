using System;
using System.Collections.Generic;

namespace PersonalizedCardGame.Models
{
    public partial class ExceptionLog
    {
        public long Id { get; set; }
        public string ErrorLog { get; set; }
        public string GameHash { get; set; }
        public string PlayerUniqueId { get; set; }
        public string ConnectionId { get; set; }
        public string GameCode { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Modified { get; set; }
        public bool? IsActive { get; set; }
        public int? LogEntryTypeId { get; set; }
    }
}
