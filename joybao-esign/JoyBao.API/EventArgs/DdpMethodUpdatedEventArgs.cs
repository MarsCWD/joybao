using System;

namespace JoyBao.API.EventArgs
{
    public class DdpMethodUpdatedEventArgs
    {
        internal DdpMethodUpdatedEventArgs(String[] callIds)
        {
            this.CallIds = callIds;
        }

        public String[] CallIds { get; private set; }
    }
}
