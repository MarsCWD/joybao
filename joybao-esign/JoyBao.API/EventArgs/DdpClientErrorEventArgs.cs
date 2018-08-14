using System;

namespace JoyBao.API.EventArgs
{
    public class DdpClientErrorEventArgs
    {
        public Exception Exception { get; private set; }
        internal DdpClientErrorEventArgs(Exception x)
        {
            this.Exception = x;
        }

    }
}
