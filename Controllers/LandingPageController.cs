using Microsoft.AspNetCore.Mvc;

namespace PersonalizedCardGame.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LandingPageController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
