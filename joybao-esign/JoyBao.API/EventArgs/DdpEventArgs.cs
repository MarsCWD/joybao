namespace JoyBao.API.EventArgs
{
    public class DdpEventArgs
    {
        public dynamic Data { get; private set; }

        internal DdpEventArgs(dynamic data)
        {
            this.Data = data;
        }
    }
}
