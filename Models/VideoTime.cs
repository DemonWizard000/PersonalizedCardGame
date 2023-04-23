namespace PersonalizedCardGame.Models
{
    public class VideoTime
    {
        public long Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int VideoTimeCount { get; set; } = 1000;

    }
}
