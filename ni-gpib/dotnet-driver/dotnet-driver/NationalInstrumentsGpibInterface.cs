using NationalInstruments.NI4882;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Text;
using System.Threading.Tasks;

namespace ni_gpib_dotnet_core
{

  public class NationalInstrumentsGpibInterfaceConnectInput : DynamicObject
  {
    public int Board { get; set; }
    public int Ifc { get; set; }
    public bool CicImmediate { get; set; }
    public bool Cic { get; set; }
  } 

  public class NationalInstrumentsGpibInterfaceConnectOutput
  {

    public NationalInstrumentsGpibInterfaceConnectOutput(string handle)
    {
      Handle = handle;
    }

    public string Handle;
  }

  public class NationalInstrumentsGpibInterface
  {

    static readonly Dictionary<string, Board> Boards = new Dictionary<string, Board>();

    public async Task<object> Connect(dynamic input)
    {
      Board board = null;
      try
      {
        int boardNumber = (int)input.board;
        bool ifc = (bool)input.ifc;
        bool cic = (bool)input.cic;
        bool cicImmediate = (bool)input.cicImmediate;
        board = new Board(boardNumber);
        if (ifc) board.SendInterfaceClear();
        if (cic) board.BecomeActiveController(cicImmediate);
        string handle = Guid.NewGuid().ToString();
        Boards.Add(handle, board);
        return await Task.FromResult(new NationalInstrumentsGpibInterfaceConnectOutput(handle));
      }
      catch (Exception)
      {
        if (board != null)
        {
          board.Dispose();
        }
        throw;
      }
    }

    public async Task<object> SelectedDeviceClear(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("handle")) throw new Exception("Missing handle");
      if (!inputIDictionary.ContainsKey("deviceAddress")) throw new Exception("Missing deviceAddress");
      string handle = (string)input.handle;
      Address deviceAddress = new Address((byte)input.deviceAddress);
      Board board = Boards[handle];
      if (board == null) throw new Exception($"Board with handle, {handle}, does not exist");
      try
      {
        board.Clear(deviceAddress);
        return await Task.FromResult(true);
      }
      catch (Exception)
      {
        throw;
      }
    }

    public async Task<object> WriteToDevice(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("handle")) throw new Exception("Missing handle");
      if (!inputIDictionary.ContainsKey("deviceAddress")) throw new Exception("Missing deviceAddress");
      if (!inputIDictionary.ContainsKey("data")) throw new Exception("Missing data");
      string handle = (string)input.handle;
      byte deviceAddress = (byte)input.deviceAddress;
      byte[] data = (byte[])input.data;
      Board board = Boards[handle];
      if (board == null) throw new Exception($"Board with handle, {handle}, does not exist");
      Device device = null;
      try
      {
        string dataString = BitConverter.ToString(data);
        Console.Write("Writing data to device address ");
        Console.Write(deviceAddress.ToString());
        Console.Write(":  ");
        Console.WriteLine(dataString);
        device = new Device(board.PrimaryAddress, deviceAddress);
        Console.Write("Device address:  ");
        Console.WriteLine(device.PrimaryAddress.ToString());
        device.Write(data);
        return await Task.FromResult(true);
      }
      catch (Exception)
      {
        throw;
      }
      finally
      {
        if (device != null) device.Dispose();
      }
    }

    public async Task<object> ReadFromDevice(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("handle")) throw new Exception("Missing handle");
      if (!inputIDictionary.ContainsKey("deviceAddress")) throw new Exception("Missing deviceAddress");
      string handle = (string)input.handle;
      byte deviceAddress = (byte)input.deviceAddress;
      Board board = Boards[handle];
      if (board == null) throw new Exception($"Board with handle, {handle}, does not exist");
      Device device = null;
      try
      {
        device = new Device(board.PrimaryAddress, deviceAddress);
        byte[] data = device.ReadByteArray();
        return await Task.FromResult(data);
      }
      catch (Exception)
      {
        throw;
      }
      finally
      {
        if (device != null) device.Dispose();
      }
    }

    public async Task<object> Disconnect(dynamic input)
    {
      IDictionary<string, object> inputIDictionary = (IDictionary<string, object>)input;
      if (!inputIDictionary.ContainsKey("handle")) throw new Exception("Missing handle");
      string handle = (string)input.handle;
      try
      {
        Board board = Boards[handle];
        if (board == null) throw new Exception($"Board with handle, {handle}, does not exist");
        bool removed = Boards.Remove(handle);
        board.Dispose();
        Console.WriteLine($"Disconnected board with handle, {handle}");
        return await Task.FromResult(removed);
      }
      catch (Exception)
      {
        throw;
      }
    }

  }

}
