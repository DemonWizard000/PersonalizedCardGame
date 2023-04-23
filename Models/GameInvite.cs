namespace PersonalizedCardGame.Models
{
    public class GameInvite
    {
        public long Id { get; set; }
        public string GameCode { get; set; } = "";
        public string CreatorId { get; set; } = "";

        public string InviteeEmail { get; set; } = "";

        public bool IsJoined { get; set; } = false;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
