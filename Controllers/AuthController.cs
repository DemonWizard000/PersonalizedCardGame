using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PersonalizedCardGame.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Reflection;

namespace PersonalizedCardGame.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _config;

        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp(RegisterVM register)
        {
            if (!ModelState.IsValid) return BadRequest(new { field = "", message="Invalid Model" });

            AppUser newUser = new AppUser
            {
                Email = register.Email,
                UserName = register.Username
            };

            IdentityResult result = await _userManager.CreateAsync(newUser, register.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { field = "", message = result.Errors.First().Description });
            }

            return Ok();
        }

        private string generateJwtToken(AppUser user)
        {
            // generate token that is valid for 7 days
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["AppSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", user.Id) }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn(SignInVM signIn)
        {
            var user = await _userManager.FindByEmailAsync(signIn.Email);

            if (user == null)
                return BadRequest(new { field = "email", message = "Email doesn't exist." });

            var result = await _signInManager.PasswordSignInAsync(user, signIn.Password, signIn.RememberMe, true);
            if (!result.Succeeded)
                return BadRequest(new { field = "password", message = "Password is incorrect." });

            var token = generateJwtToken(user);

            return Ok(new { token = token });
        }

        [Authorize]
        [HttpPost("get-user")]
        public async Task<AppUser> GetUser()
        {
            string userId = HttpContext.Items["UserId"] as string;
            var user = await _userManager.FindByIdAsync(userId);
            return user;
        }

        [Authorize]
        [HttpPost("sign-out")]
        public async Task<bool> SignOut()
        {
            var user = await _userManager.GetUserAsync(User);
            await _signInManager.SignOutAsync();
            return true;
        }
    }
}
