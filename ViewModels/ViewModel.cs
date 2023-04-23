using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalizedCardGame.Models
{
    public class ViewModel
    {
    }

    public class GameHash
    {

    }


    #region request/response models

    public class LoginRequest
    {
        public string? UserName { get; set; }

        public string? Password { get; set; }


    }



    public class LoginResponse
    {

        public string? SignalRConnectionId { get; set; }

        public string? PlayerUniqueId { get; set; }

        public string? UserName { get; set; }


    }




    public class CreateGame
    {
        public string? HostName { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public string? GameCode { get; set; }

        public string? GameHash { get; set; }

        public string? ConnectionId { get; set; }

        public string? PlayerUniqueId { get; set; }

        public string? GamePlayerHash { get; set; }

        public bool IsRecurring { get; set; } = false;

        public bool IsLocked { get; set; } = false;

        public bool IsInviteesOnly { get; set; } = false;

        public string InviteeEmail { get; set; } = string.Empty;
        public long InviteeId { get; set; }
    }


    public class PlayerGenericActionRequest
    {
        public string? PlayerUniqueId { get; set; }

        public string? GameCode { get; set; }

        public string? ActionCode { get; set; }

        public string? GameHash { get; set; }

        public string? ConnectionId { get; set; }


    }

    public class PlayerActionResponse
    {
        public string? ErrCode { get; set; }

        public string? ErrMessage { get; set; }



    }





    public class ActivePlayer
    {
        public string? PlayerId { get; set; }
        public string? PlayerName { get; set; }
        public List<PlayerCardViewModel> PlayerCardViewModels { get; set; }
        public string? PlayerAmount { get; set; }
        public string? ConnectionId { get; set; }
        public string? Sno { get; set; }
        public string? IsDealer { get; set; }
        public string? IsCurrent { get; set; }
        public string? IsFolded { get; set; }
        public string? CurrentRoundStatus { get; set; }
        public string? PlayerNetStatusFinal { get; set; }
        public string? Balance { get; set; }
    }


    public class PlayerCardViewModel
    {
        public string? Value { get; set; }
        public string? Presentation { get; set; }


    }


    public class SendNotificationRequest
    {

        public string? NotificationType { get; set; }

        public string? GameCode { get; set; }

        public string? NotificationMessage { get; set; }

    }

    public class UpdateHashRequest
    {
        public string? UserId { get; set; }
        public string? GameCode { get; set; }

        public string? GameHash { get; set; }

        public string? ConnectionId { get; set; }

        public string? PlayerUniqueId { get; set; }

        public string? ActionMessage { get; set; }


    }




    public class CommonResponse
    {
        public string? Message { get; set; }
        public string? ResponseCode { get; set; }

    }


    public class UpdateUserIdentityRequest
    {
        public string? PlayerUniqueId { get; set; }

        public string? SignalRConnectionId { get; set; }

    }


    #endregion



    #region

    public class GameLoggingRequest
    {

        public string? ErrorLog { get; set; }
        public string? GameHash { get; set; }
        public string? UserIdentityFromCookie { get; set; }

        public string? ConnectionId { get; set; }
        public string? GameCode { get; set; }

        public int LogEntryTypeId { get; set; }

    }


    #endregion


}
