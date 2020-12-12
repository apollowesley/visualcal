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

  public class NationalInstrumentsGpibInterface : GpibInterfaceBase
  {

    static readonly Dictionary<string, Board> Boards = new Dictionary<string, Board>();

    private Board getBoard(string handle)
    {
      Board board = Boards[handle];
      if (board == null) throw new Exception($"Board with handle, {handle}, does not exist");
      return board;
    }

    protected override Task OnConnect(string boardHandle, int boardNumber, bool ifc = false, bool cic = false, bool cicImmediate = false)
    {
      Board board = null;
      try
      {
        board = new Board(boardNumber);
        if (ifc) board.SendInterfaceClear();
        if (cic) board.BecomeActiveController(cicImmediate);
        Boards.Add(boardHandle, board);
        return Task.FromResult(true);
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

    protected override Task OnSelectedDeviceClear(string boardHandle, byte devicePrimaryAddress)
    {
      Board board = getBoard(boardHandle);
      Address deviceAddress = new Address(devicePrimaryAddress);
      board.Clear(deviceAddress);
      return Task.FromResult(true);
    }

    protected override Task<byte[]> OnWriteToDevice(string boardHandle, byte devicePrimaryAddress, byte[] data)
    {
      BitConverter.ToString(data);
      Board board = getBoard(boardHandle);
      Address deviceAddress = new Address(devicePrimaryAddress);
      Device device = null;
      try
      {
        string dataString = Encoding.ASCII.GetString(data);
        device = new Device(board.PrimaryAddress, deviceAddress);
        device.Write(data);
        device.Dispose();
        return Task.FromResult(data);
      }
      catch (Exception)
      {
        if (device != null) device.Dispose();
        throw;
      }
    }

    protected override Task<byte[]> OnReadFromDevice(string boardHandle, byte devicePrimaryAddress)
    {
      Board board = getBoard(boardHandle);
      Address deviceAddress = new Address(devicePrimaryAddress);
      Device device = null;
      try
      {
        device = new Device(board.PrimaryAddress, deviceAddress);
        byte[] data = device.ReadByteArray();
        device.Dispose();
        return Task.FromResult(data);
      }
      catch (Exception)
      {
        if (device != null) device.Dispose();
        throw;
      }
    }

    protected override Task<bool> OnDisconnect(string boardHandle)
    {
      try
      {
        Board board = getBoard(boardHandle);
        bool removed = Boards.Remove(boardHandle);
        if (board != null) board.Dispose();
        return Task.FromResult(removed);
      }
      catch (Exception)
      {
        throw;
      }
    }

  }

}
