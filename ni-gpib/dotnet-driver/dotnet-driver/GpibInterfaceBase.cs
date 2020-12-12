using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ni_gpib_dotnet_core
{

  public class ConnectInput : DynamicObject
  {
    public int Board { get; set; }
    public int Ifc { get; set; }
    public bool CicImmediate { get; set; }
    public bool Cic { get; set; }
  }

  public class ConnectOutput
  {

    public ConnectOutput(string handle)
    {
      Handle = handle;
    }

    public string Handle;
  }

  public abstract class GpibInterfaceBase
  {
    protected GpibInterfaceBase() {}

    protected abstract Task OnConnect(string boardHandle, int boardNumber, bool ifc = false, bool cic = false, bool cicImmediate = false);

    public async Task<object> Connect(dynamic input)
    {
      try
      {
        IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
        if (!inputIDictionary.ContainsKey("boardNumber")) throw new Exception("Missing boardNumber");
        int boardNumber = (int)input.boardNumber;
        bool ifc = inputIDictionary.ContainsKey("ifc") && (bool)input.ifc;
        bool cic = inputIDictionary.ContainsKey("cic") && (bool)input.cic;
        bool cicImmediate = inputIDictionary.ContainsKey("cicImmediate") && (bool)input.cicImmediate;
        string boardHandle = Guid.NewGuid().ToString();
        await OnConnect(boardHandle, boardNumber, ifc, cic, cicImmediate);
        return await Task.FromResult(new ConnectOutput(boardHandle));
      }
      catch (Exception)
      {

        throw;
      }
    }

    protected abstract Task OnSelectedDeviceClear(string boardHandle, byte devicePrimaryAddress);

    public async Task<object> SelectedDeviceClear(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("boardHandle")) throw new Exception("Missing boardHandle");
      if (!inputIDictionary.ContainsKey("devicePrimaryAddress")) throw new Exception("Missing devicePrimaryAddress");
      string boardHandle = (string)input.boardHandle;
      byte devicePrimaryAddress = (byte)input.devicePrimaryAddress;
      await OnSelectedDeviceClear(boardHandle, devicePrimaryAddress);
      return Task.FromResult(true);
    }

    protected abstract Task<byte[]> OnWriteToDevice(string boardHandle, byte devicePrimaryAddress, byte[] data);

    public async Task<object> WriteToDevice(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("boardHandle")) throw new Exception("Missing boardHandle");
      if (!inputIDictionary.ContainsKey("devicePrimaryAddress")) throw new Exception("Missing devicePrimaryAddress");
      if (!inputIDictionary.ContainsKey("data")) throw new Exception("Missing data");
      string boardHandle = (string)input.boardHandle;
      byte devicePrimaryAddress = (byte)input.devicePrimaryAddress;
      byte[] data = (byte[])input.data;
      data = await OnWriteToDevice(boardHandle, devicePrimaryAddress, data);
      return Task.FromResult(data);
    }

    protected abstract Task<byte[]> OnReadFromDevice(string boardHandle, byte devicePrimaryAddress);

    public async Task<object> ReadFromDevice(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("boardHandle")) throw new Exception("Missing boardHandle");
      if (!inputIDictionary.ContainsKey("devicePrimaryAddress")) throw new Exception("Missing devicePrimaryAddress");
      string boardHandle = (string)input.boardHandle;
      byte devicePrimaryAddress = (byte)input.devicePrimaryAddress;
      byte[] data = await OnReadFromDevice(boardHandle, devicePrimaryAddress);
      return Task.FromResult(data);
    }

    protected abstract Task<bool> OnDisconnect(string boardHandle);

    public async Task<object> Disconnect(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("boardHandle")) throw new Exception("Missing boardHandle");
      string boardHandle = (string)input.boardHandle;
      bool didDisconnect = await OnDisconnect(boardHandle);
      return Task.FromResult(didDisconnect);
    }

  }

}
