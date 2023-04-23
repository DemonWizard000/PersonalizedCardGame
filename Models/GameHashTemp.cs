using System;
using System.Collections.Generic;

namespace PersonalizedCardGame.Models
{
    public partial class GameHashTemp
    {
        public long Id { get; set; }
        public string HostName { get; set; } = string.Empty;
        public string GameCreatorId { get; set; }
        public string GameCode { get; set; }
        public string GameHash { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsEnded { get; set; } = false;
        // this means only invitees can join the game
        public bool? IsOnlyInvitees { get; set; } = true;
        // no one can join while it's locked
        public bool? IsLocked { get; set; } = false;
        public DateTime? Created { get; set; } = DateTime.Now;
        public DateTime? Modified { get; set; } = DateTime.Now;
        public string GamePlayerHash { get; set; }
    }
}
