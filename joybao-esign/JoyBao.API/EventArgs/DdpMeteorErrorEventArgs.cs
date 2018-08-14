using System;

namespace JoyBao.API.EventArgs
{
    public class DdpMeteorErrorEventArgs
    {
        internal DdpMeteorErrorEventArgs(String reason, dynamic originalMessage)
        {
            this.OriginalMessage = originalMessage;
            this.Reason = reason;
        }

        public dynamic OriginalMessage { get; private set; }
        public String Reason { get; private set; }
    }
}
