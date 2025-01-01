using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Backend.Hubs
{
    public class MyHub : Hub
    {
        private readonly ILogger<MyHub> _logger;

        public MyHub(ILogger<MyHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                if (Context.User?.Identity?.IsAuthenticated == true)
                {
                    // Kiểm tra vai trò của người dùng và thêm vào nhóm tương ứng
                    if (Context.User.IsInRole("Doctor"))
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, "Doctors");
                        _logger.LogInformation($"Doctor added to Doctors group: {Context.ConnectionId}");
                    }
                    else if (Context.User.IsInRole("Admin"))
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                        _logger.LogInformation($"Admin added to Admins group: {Context.ConnectionId}");
                    }
                    else
                    {
                        // User mặc định sẽ được thêm vào group theo UserId
                        string userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (!string.IsNullOrEmpty(userId))
                        {
                            await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");
                            _logger.LogInformation($"User added to User-{userId} group: {Context.ConnectionId}");
                        }
                    }
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in OnConnectedAsync: {ex.Message}");
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                if (Context.User?.Identity?.IsAuthenticated == true)
                {
                    if (Context.User.IsInRole("Doctor"))
                    {
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Doctors");
                        _logger.LogInformation($"Doctor removed from Doctors group: {Context.ConnectionId}");
                    }
                    else if (Context.User.IsInRole("Admin"))
                    {
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
                        _logger.LogInformation($"Admin removed from Admins group: {Context.ConnectionId}");
                    }
                    else
                    {
                        string userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (!string.IsNullOrEmpty(userId))
                        {
                            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User-{userId}");
                            _logger.LogInformation($"User removed from User-{userId} group: {Context.ConnectionId}");
                        }
                    }
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in OnDisconnectedAsync: {ex.Message}");
                throw;
            }
        }

        // Gửi thông báo đến Admins
        public async Task NotifyAdmins(string message)
        {
            await Clients.Group("Admins").SendAsync("ReceiveNotification", new { message });
        }

        // Gửi thông báo đến User
        public async Task NotifyUser(string userId, string message, object details = null)
        {
            await Clients.Group($"User-{userId}").SendAsync("ReceiveNotification", new { message, details });
        }
    }
}
