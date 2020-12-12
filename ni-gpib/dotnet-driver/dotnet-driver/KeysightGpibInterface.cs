using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Keysight.TMFramework.Connectivity;

namespace ni_gpib_dotnet_core
{
  public class KeysightGpibInterface
  {

    KeysightGpibInterface()
    {
      Kt488Wrap.SendIFC(0);
      Kt488Wrap.ibdev(0, 22, 0, Kt488Wrap.T1s, 1, 10);
    }

  }
}
