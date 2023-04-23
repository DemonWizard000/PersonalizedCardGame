using Microsoft.AspNetCore.Mvc;
using PersonalizedCardGame.Hubs;
using PersonalizedCardGame.Models;
using Microsoft.AspNetCore.SignalR;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nancy.Json;
using Elmah.Io.AspNetCore;

namespace PersonalizedCardGame.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class GameV2Controller : ControllerBase
    {

        private IHubContext<GameClass> _HubContext;
        private CustomHelper _helper;
        private DBCardGameContext _CardGameContext;
        private UserManager<AppUser> _UserManager;

        public GameV2Controller(IHubContext<GameClass> hubcontext, DBCardGameContext context, UserManager<AppUser> userManager)
        {
            _CardGameContext = context;
            if (_HubContext == null)
            {
                _HubContext = hubcontext;
            }

            if (_helper == null)
                _helper = new CustomHelper();

            _UserManager = userManager;
        }

        /*
        CreateGame
        @param
        UserId: UserId that create game.
        GameCode: Generated GameCode of the new game.
        GameHash: Intialized GameHash of the new game.
        ConnectionId: SignalR connectionId of the game.
        PlayerUniqueId: PlayerUniqueId (UseName + pk2 + ConnectionId)
        GamePlayerHash: Hash of the players(only creater when you create game)
        */
        [HttpPost]
        public async Task<IActionResult> _CreateGame([FromBody] CreateGame model)
        {
            var resp = new CommonResponse();
            try
            {
                var gameresp = _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefault();

                // temporary if not keeping the records

                // if game with the same GameCode doesn't exit
                if (gameresp == null)
                {
                    resp.Message = "Success";
                    resp.ResponseCode = "100";

                    JavaScriptSerializer js = new JavaScriptSerializer();
                    var gameplayerhash = js.Deserialize<ActivePlayer>(model.GamePlayerHash);
                    
                    //Add new GameHashTemp
                    _CardGameContext.GameHashTemp.Add(new GameHashTemp() {
                        Created = DateTime.Now,
                        HostName = model.HostName,
                        GameCode = model.GameCode,
                        GameHash = model.GameHash,
                        IsActive = true,
                        GamePlayerHash = model.GamePlayerHash,
                        GameCreatorId = model.PlayerUniqueId,
                        IsOnlyInvitees = model.IsInviteesOnly
                    });

                    /*
                    Add New Player
                    Set creater as dealer and active and current.
                    */
                    _CardGameContext.Player.Add(new Player()
                    {
                        PlayerUniqueId = model.PlayerUniqueId,
                        GameCode = model.GameCode,
                        IsConnected = true,
                        IsDealer = true,
                        IsActive = true,
                        UserName = model.UserId.Split("pk2")[0]
                    });

                    var user = await _UserManager.FindByIdAsync(HttpContext.Items["UserId"] as string);
                    if (model.IsRecurring && user != null)
                    {
                        _CardGameContext.RecurringGames.Add(new RecurringGames()
                        {
                            Name = model.HostName,
                            CreatorId = model.PlayerUniqueId,
                        });
                    }

                    _CardGameContext.SaveChanges();

                    return Ok(resp);
                }

                // if game with the same GameCode exist already.
                else
                {
                    resp.Message = "Game Already exist. Please try with new code";
                    resp.ResponseCode = "150";
                    return Ok(resp);
                }

            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                //_helper.ExceptionLog(new GameLoggingRequest() { ErrorLog = ex.Message, GameCode = model.GameCode, GameHash = model.GameHash, UserIdentityFromCookie = model.PlayerUniqueId });
                resp.Message = "error";
                resp.ResponseCode = "101";
                return Ok(resp);
            }

        }
        /*
             
        */
        [Authorize]
        [HttpPost]
        public async Task<List<GameHashTemp>> _GetPastGames()
        {
            var user = await _UserManager.FindByIdAsync(HttpContext.Items["UserId"] as string);
            var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.IsEnded == true && x.GameCreatorId == user.Id).ToListAsync();
            return gameresp;
        }

        [Authorize]
        [HttpPost]
        public async Task<List<RecurringGames>> _GetRecurringGames()
        {
            var user = await _UserManager.FindByIdAsync(HttpContext.Items["UserId"] as string);
            var gameresp = await _CardGameContext.RecurringGames.Where(x => x.CreatorId == user.Id).ToListAsync();
            return gameresp;
        }

        /*
        Join
        @param
        UserId: UserId that create game.
        GameCode: Generated GameCode of the new game.
        GameHash: Intialized GameHash of the new game.
        ConnectionId: SignalR connectionId of the game.
        PlayerUniqueId: PlayerUniqueId (UseName + pk2 + ConnectionId)
        GamePlayerHash: Hash of the players

        response:
        -1: game is locked
        -2: you're not invited
        null: exception
        object: gamehashtemp when it's succed.
        */
        [HttpPost]
        public async Task<IActionResult> _JoinGame([FromBody] CreateGame model)
        {
            var user = await _UserManager.FindByIdAsync(HttpContext.Items["UserId"] as string);

            try
            {
                var resp = new CommonResponse();
                var gameresp = _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode && x.IsActive == true).FirstOrDefault();
                // if Game with same GameCode is active
                if (gameresp != null)
                {
                    //when game is lock, only creator can join
                    if (gameresp.IsLocked == true && model.PlayerUniqueId != gameresp.GameCreatorId)
                        return Ok(-1);
                    
                    if (gameresp.IsOnlyInvitees == true && model.PlayerUniqueId != gameresp.GameCreatorId)
                    {
                        var invitee_info = await _UserManager.FindByIdAsync(model.PlayerUniqueId);
                        if (invitee_info == null)
                            return Ok(-2);
                        var invite = await _CardGameContext.GameInvite.Where(x => x.GameCode == model.GameCode && x.InviteeEmail == invitee_info.Email).FirstOrDefaultAsync();
                        if (invite == null)
                        {
                            return Ok(-2);
                        }
                    }

                    //Update GamePlayerHash to the model's GamePlayerHash value.
                    //gameresp.GamePlayerHash = model.GamePlayerHash;

                    //Change player's status(Set player as active and connected, also change player's current GameCode)
                    var currentplayer = _CardGameContext.Player.Where(x => x.PlayerUniqueId == model.PlayerUniqueId && x.GameCode == model.GameCode).FirstOrDefault();
                    if(currentplayer != null)
                    {
                        currentplayer!.IsConnected = true;
                        currentplayer!.IsActive = true;
                        currentplayer!.SignalRconnectionId = model.ConnectionId;
                        //currentplayer!.UserName = model.UserId;
                        _CardGameContext.Player.Update(currentplayer);
                    }

                    else
                    {
                        _CardGameContext.Player.Add(new Player()
                        {
                            PlayerUniqueId = model.PlayerUniqueId,
                            SignalRconnectionId = model.ConnectionId,
                            GameCode = model.GameCode,
                            IsConnected = true,
                            IsActive = true,
                            UserName = model.UserId.Split("pk2")[0],
                        });
                    }

                    _CardGameContext.SaveChanges();
                    return Ok(gameresp);
                }

                //otherwise
                else
                {
                    return Ok(null);
                }
                // PersonalizedCardGame.Hubs.GameClass.
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                //ExceptionLogger(" RequestModel " + model.UserId + " --> " + ex.InnerException.ToString() + MethodBase.GetCurrentMethod());
                return Ok(null);
            }
        }

        

        /*
        Add PlayerAction ("SitOut" or "Rejoin")
        @param
        PlayerUniqueId: UniqueId of the action taker.
        GameCode: GameCode of the Game player take action in.
        ActionCode: "SitOut" or "Rejoin"
        */
        [HttpPost]
        public IActionResult _PlayerAction([FromBody] PlayerGenericActionRequest model)
        {

            var resp = new PlayerActionResponse();
            try
            {
                //Find player by PlayerUniqueId
                var playertmp = _CardGameContext.Player.Where(x => x.UserName == model.PlayerUniqueId && x.GameCode == model.GameCode).FirstOrDefault();

                if (playertmp != null)
                {
                    //if AcitonCode = SitOut, player's IsSitOut property true
                    if (model.ActionCode == "SitOut")
                    {
                        playertmp.IsSitOut = true;
                        playertmp.Modified = DateTime.Now;
                    }

                    //if AcitonCode = Rejoin, player's Rejoin property true
                    else if (model.ActionCode == "Rejoin")
                    {
                        playertmp.IsSitOut = false;
                        playertmp.Modified = DateTime.Now;
                    }

                    _CardGameContext.SaveChanges();

                    resp.ErrCode = "100";
                    resp.ErrMessage = "success";
                }
                else
                {
                    resp.ErrCode = "101";
                    resp.ErrMessage = "Player not found";
                }

                //Add Log
                _helper.ExceptionLog(new GameLoggingRequest()
                {
                    ConnectionId = model.ConnectionId,
                    ErrorLog = model.ActionCode,
                    GameCode = model.GameCode,
                    GameHash = model.GameHash,
                    LogEntryTypeId = 1,
                    UserIdentityFromCookie = model.PlayerUniqueId
                });
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                resp.ErrCode = "102";
                resp.ErrMessage = ex.Message;
            }

            return Ok(resp);

        }


        /*
            Get Game Players and return them. 
        */
        [HttpPost]
        public IActionResult _GetGamePlayers([FromBody] PlayerGenericActionRequest model)
        {
            var resp = new PlayerActionResponse();
            try
            {
                var playerlist = _CardGameContext.Player.Where(x => x.GameCode == model.GameCode).OrderByDescending(x => x.Created).ToList().TakeLast(10);
                if (playerlist != null)
                {
                    var lst = playerlist.ToList();
                    return Ok(playerlist.ToList());
                }
                else
                {
                    return Ok(new List<Player>());
                }
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return Ok(null);
            }
        }

        [HttpPost]
        public async Task<bool> _EndGame([FromBody] CreateGame model)
        {
            try
            {

                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();

                gameresp.IsEnded = true;
                _CardGameContext.GameHashTemp.Update(gameresp);

                await _CardGameContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }

        }

        [HttpPost]
        public async Task<bool> _LockGame([FromBody] CreateGame model)
        {
            try
            {
                string userId = HttpContext.Items["UserId"] as string;
                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();
                if (gameresp.GameCreatorId != userId)
                    return false;
                gameresp.IsLocked = model.IsLocked;
                _CardGameContext.GameHashTemp.Update(gameresp);
                await _CardGameContext.SaveChangesAsync();
                return true;
            } catch(Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }
            
        }

        [HttpPost]
        public async Task<bool> _GetLockStatus([FromBody] CreateGame model)
        {
            try
            {
                string userId = HttpContext.Items["UserId"] as string;
                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();
                if (gameresp == null)
                    return false;
                return (bool)gameresp.IsLocked;
            }
            catch (Exception ex) {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }
        }

        [HttpPost]
        public async Task<List<GameInvite>> _GetInvitees([FromBody] CreateGame model)
        {
            var invitees = await _CardGameContext.GameInvite.Where(x => x.GameCode == model.GameCode).ToListAsync();
            return invitees;
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> _GetIsCreator([FromBody] CreateGame model)
        {
            try
            {
                string userId = HttpContext.Items["UserId"] as string;
                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();
                if (gameresp == null)
                    return false;
                return gameresp.GameCreatorId == userId;
            } catch(Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> _Invite([FromBody] CreateGame model)
        {
            try
            {
                string userId = HttpContext.Items["UserId"] as string;
                var user = await _UserManager.FindByIdAsync(userId);

                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();
                if (gameresp.GameCreatorId != userId)
                    return false;

                _CardGameContext.GameInvite.Add(new GameInvite()
                {
                    CreatorId = user.Id,
                    InviteeEmail = model.InviteeEmail,
                    GameCode = model.GameCode
                });

                await _CardGameContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<bool> _RemoveInvite([FromBody] CreateGame model)
        {
            try
            {
                string userId = HttpContext.Items["UserId"] as string;
                var user = await _UserManager.FindByIdAsync(userId);

                var gameresp = await _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefaultAsync();
                if (gameresp.GameCreatorId != userId)
                    return false;

                var invite = await _CardGameContext.GameInvite.Where(x => x.GameCode == model.GameCode && x.InviteeEmail == model.InviteeEmail).FirstOrDefaultAsync();
                _CardGameContext.GameInvite.Remove(invite);

                await _CardGameContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return false;
            }
        }

        /*
            Get GameHash by GameCode
        */
        [HttpPost]
        public IActionResult _GetGameHash([FromBody] CreateGame model)
        {
            try
            {
                if (!string.IsNullOrEmpty(model.GameCode))
                {
                    var resp = new CommonResponse();
                    var gameresp = _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode && x.IsActive == true).FirstOrDefault();
                    
                    if (gameresp != null)
                    {
                        return Ok(gameresp.GameHash);
                    }

                    else
                    {
                        return Ok("error- game not found " + model.GameCode);
                    }
                    // PersonalizedCardGame.Hubs.GameClass.
                }
                else
                {
                    //ExceptionLogger(" RequestModel  --> requested for empty code ");
                    return Ok("error");

                }
            }
            catch (Exception ex)
            {
                ElmahIoApi.Log(ex, HttpContext);
                return Ok("error");
            }
        }

        /*
        Update GameHash
        @param
        GameCode: GameCode of the GameHash to Update
        PlayerUniqueId: PlayerId of the action taker.
        GameHash: GameHash to update.
        ActionMessage: ActionMessage of updaing GameHash
        */
        [HttpPost]
        public IActionResult _UpdateGameHash([FromBody] UpdateHashRequest model)
        {
            var resp = new CommonResponse();

            //Get Prev GameHash and players
            var PrevHash = _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefault();
            var players = _CardGameContext.Player.Where(x => x.IsActive == true && x.GameCode == model.GameCode).ToList();

            //start transaction
            using (var transaction = _CardGameContext.Database.BeginTransaction())
            {
                try
                {
                    //get GameHash by GameCode
                    var gameresp = _CardGameContext.GameHashTemp.Where(x => x.GameCode == model.GameCode).FirstOrDefault();
                    
                    // if gameresp exist.
                    if (gameresp != null)
                    {
                        gameresp.GameHash = model.GameHash;
                        gameresp.Modified = DateTime.Now;
                        var userid = _CardGameContext.Player.Where(x => x.PlayerUniqueId == model.PlayerUniqueId && x.GameCode == model.GameCode).FirstOrDefault().PlayerUniqueId;
                        
                        //Add GameLog
                        //_CardGameContext.GameLog.Add(new GameLog() { Created = DateTime.Now, GameId = gameresp.Id, PlayerId = userid, Action = model.ActionMessage });
                        int updated = _CardGameContext.SaveChanges();

                        transaction.Commit();

                        if (updated == 1)
                        {
                            //send ReceiveHashV1 Message to all of members.
                            foreach (var p in players)
                            {
                                if (p.PlayerUniqueId != userid)
                                {
                                    _HubContext.Clients.Client(p.SignalRconnectionId).SendAsync("ReceiveHashV1", "100");
                                }
                            }
                            return Ok("success");
                        }
                        else
                        {
                            return Ok("Error");
                        }
                    }
                    else
                    {
                        return Ok("Error");

                    }
                }
                catch (Exception ex)
                {

                    transaction.Rollback();

                    //Send previous Hash(not updated Hash) to all players.
                    foreach (var p in players)
                    {
                        _HubContext.Clients.Client(p.SignalRconnectionId).SendAsync("ReceiveHashV1", PrevHash.GameHash, "100");
                    }

                    ExceptionLogger("UpdateGameHash from" + model.UserId + " --> " + ex.InnerException.ToString());

                    return Ok("error");

                }
                // PersonalizedCardGame.Hubs.GameClass.
            }
        }

        /*
        Send ReceiveCancelHandNotification msg.
        @param
        NotificationType: type of Notification("100", "101")
        GameCode: GameCode that send notification.
        NotificationMessage: Notification Msg
        */
        [HttpPost]
        public IActionResult _SendCancelHandNotification([FromBody] SendNotificationRequest model)
        {
            try
            {
                var players = _CardGameContext.Player.Where(x => x.IsActive == true && x.GameCode == model.GameCode).ToList();
                int updated = _CardGameContext.SaveChanges();

                foreach (var p in players)
                {
                    _HubContext.Clients.Client(p.SignalRconnectionId).SendAsync("ReceiveCancelHandNotification", "100");
                }
                return Ok("success");


            }
            catch (Exception ex)
            {
                return Ok("error");

            }
            // PersonalizedCardGame.Hubs.GameClass.

        }

        [HttpPost]
        public string ExceptionLogger([FromBody] string request)
        {
            return "";
        }

        [HttpPost]
        public IActionResult GameLogginExtension([FromBody] GameLoggingRequest model)
        {
            var resp = new CommonResponse();

            var x = model.GameHash.Length;

            var tsk = _helper.ExceptionLog(model);

            if (tsk == true)
            {
                resp.Message = "success";
                resp.ResponseCode = "100";

            }
            else
            {
                resp.Message = "error";
                resp.ResponseCode = "101";

            }

            return Ok(resp);


        }

        // first time if player dont have unique id 
        [HttpPost]
        public JsonResult _GetUserIdentity()
        {
            try
            {
                var guid = Guid.NewGuid().ToString();
                _CardGameContext.Player.Add(new Player() { Created = DateTime.Now, PlayerUniqueId = guid, IsActive = true });
                _CardGameContext.SaveChanges();
                return new JsonResult(guid);
            }
            catch (Exception ex)
            {
                ExceptionLogger(ex.ToString());
                return new JsonResult(ex.ToString());
            }
        }

        /*
            Update User Identity after creating uniqueid and updating connection id
        
            Can't see any use.
        */
        [HttpPost]
        public IActionResult _UpdateUserIdentity([FromBody] string request)
        {
            try
            {

                JavaScriptSerializer js = new JavaScriptSerializer();
                var req = js.Deserialize<UpdateUserIdentityRequest>(request);


                var player = _CardGameContext.Player.Where(x => x.PlayerUniqueId == req.PlayerUniqueId).FirstOrDefault();
                if (player != null)
                {
                    player.LastActionTime = DateTime.Now;
                    player.Modified = DateTime.Now;
                    player.SignalRconnectionId = req.SignalRConnectionId;
                    player.IsConnected = true;

                }
                _CardGameContext.SaveChanges();

                return Ok("success");

            }
            catch (Exception ex)
            {
                return Ok("error");
            }

        }
    }
}