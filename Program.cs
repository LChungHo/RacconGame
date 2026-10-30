using RaccoonGame.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
builder.Services.AddSingleton<LeaderboardService>();
var app = builder.Build();
var pathBase = builder.Configuration["Game:PathBase"];
if (!string.IsNullOrEmpty(pathBase)) app.UsePathBase(pathBase);
if (!app.Environment.IsDevelopment()) app.UseExceptionHandler("/error");
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/error", () => Results.Problem("페이지를 불러오지 못했습니다."));
app.Run();
