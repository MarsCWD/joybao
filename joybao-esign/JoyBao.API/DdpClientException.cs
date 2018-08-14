using System;
namespace JoyBao.API
{
    [Serializable]
    public class DdpClientException : Exception
    {
        public DdpClientException(String message) : base(message) { }
    }
}
