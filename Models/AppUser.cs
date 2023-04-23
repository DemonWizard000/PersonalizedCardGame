using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace PersonalizedCardGame.Models
{
    public class AppUser: IdentityUser
    {
        public int VideoTimeCount { get; set; } = 1000;
    }
}
