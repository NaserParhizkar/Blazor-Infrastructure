using System;
using System.Collections.Generic;
using System.Text;

namespace Common.Service
{
    public interface IEntity: IDisposable
    {
        MyContext Context { get; set; }
    }
}
