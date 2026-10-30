var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
var app = builder.Build();
if (!app.Environment.IsDevelopment()) app.UseExceptionHandler("/error");
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/error", () => Results.Problem("페이지를 불러오지 못했습니다."));
app.Run();
