using Microsoft.AspNetCore.Mvc;
using RaccoonGame.ViewModels;
namespace RaccoonGame.Controllers;
public sealed class GameController : Controller
{
    [HttpGet("/")]
    public IActionResult Index() => View(new GamePageViewModel(Url.Content("~/"), 288, 224));
}
