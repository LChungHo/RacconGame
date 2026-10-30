using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using RaccoonGame.Services;

namespace RaccoonGame.Controllers;

[ApiController]
[Route("api/leaderboard")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class LeaderboardController(LeaderboardService leaderboard, ILogger<LeaderboardController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        try { return Ok(new { leaders = await leaderboard.GetLeaders(cancellationToken) }); }
        catch (Exception exception) when (IsStorageFailure(exception)) { return StorageFailure(exception); }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(2048)]
    public async Task<IActionResult> Post(ScoreSubmission submission, CancellationToken cancellationToken)
    {
        try { return Ok(await leaderboard.Submit(submission, cancellationToken)); }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
        catch (Exception exception) when (IsStorageFailure(exception)) { return StorageFailure(exception); }
    }

    private static bool IsStorageFailure(Exception exception) =>
        exception is SqliteException or IOException or UnauthorizedAccessException;

    private ObjectResult StorageFailure(Exception exception)
    {
        logger.LogError(exception, "Leaderboard storage is unavailable.");
        return StatusCode(StatusCodes.Status503ServiceUnavailable,
            new { message = "순위를 저장하거나 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." });
    }
}
