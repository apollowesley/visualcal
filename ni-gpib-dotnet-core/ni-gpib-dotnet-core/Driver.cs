using System;
using System.Threading.Tasks;
using NationalInstruments.NI4882;

namespace ni_gpib_dotnet_core
{
    public class Driver
    {

      public Driver()
      {
      }

      public async Task Connect(dynamic input = null)
      {
        Device driver = new Device(0, 2);
        driver.Clear();
        driver.Dispose();
        await Task.CompletedTask;
    }

    }
}
