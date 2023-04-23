using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PersonalizedCardGame;
using PersonalizedCardGame.Hubs;
using System.IO;
using System.Configuration;
//using Microsoft.AspNetCore.Cors;
using Nancy.Json;
using PersonalizedCardGame.Models;
using System.Text;
using Microsoft.AspNetCore.SignalR;
using System.Reflection;
using System.Collections.Concurrent;
/*using PersonalizedCardGame.Models.ViewModels;*/
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using Elmah.Io.AspNetCore;

namespace PersonalizedCardGame
{
    public class CustomHelper
    {
        public bool ExceptionLog(GameLoggingRequest request)
        {
            try
            {
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

    }
}
