/* Filename - devquery.c
 * 
 *  Overview: This example uses basic device level calls to send
 *  a query to an instrument on the GPIB.  The instrument address, GPIB
 *  board number, data string, and other options are hardcoded below
 *  and will need to be changed to suit your particular instrument. 
 *
 *  This sample application is comprised of three basic parts:
 *
 *  1. Initialization
 *  2. Main Body
 *  3. Cleanup
 *
 *  The Initialization portion consists of getting a handle to a
 *  device and clearing the device.
 *
 *  In the Main Body, this application queries a device for its
 *  identification code by issuing the '*IDN?' command. Many
 *  instruments respond to this command with an identification string.
 *  Note, 488.2 compliant devices are required to respond to this
 *  command.
 *
 *  The last step, Cleanup, takes the board offline.
 */
#include <ni4882.h>
#include <stdlib.h>
#include <stdio.h>

static void GpibError(char *msg); /* Error function declaration              */

static int Device = 0;            /* Device unit descriptor                  */
static int BoardIndex = 0;        /* Interface Index (GPIB0=0,GPIB1=1,etc.)  */
	
int main() {
   int   PrimaryAddress = 2;      /* Primary address of the device           */
   int   SecondaryAddress = 0;    /* Secondary address of the device         */
   char  Buffer[101];             /* Read buffer                             */
   unsigned int RetVal;           /* Returned ibsta from NI-488.2 calls      */

/*****************************************************************************
 * Initialization - Done only once at the beginning of your application.
 *****************************************************************************/

   Device = ibdev(                /* Create a unit descriptor handle         */
         BoardIndex,              /* Board Index (GPIB0 = 0, GPIB1 = 1, ...) */
         PrimaryAddress,          /* Device primary address                  */
         SecondaryAddress,        /* Device secondary address                */
         T10s,                    /* Timeout setting (T10s = 10 seconds)     */
         1,                       /* Assert EOI line at end of write         */
         0);                      /* EOS termination mode                    */
   if (Device == -1) {            /* Check for GPIB Error                    */
      GpibError("ibdev Error"); 
   }

   RetVal = ibclr(Device);        /* Clear the device                        */
   if (RetVal & ERR) {
      GpibError("ibclr Error");
   }

/*****************************************************************************
 * Main Application Body - Write the majority of your GPIB code here.
 *****************************************************************************/
   printf("Sending string to instrument.\n");

   RetVal = ibwrt(Device, "*IDN?", 5);     /* Send the identification query command   */
   if (RetVal & ERR) {
      GpibError("ibwrt Error");
   }

   RetVal = ibrd(Device, Buffer, 100);     /* Read up to 100 bytes from the device    */
   if (RetVal & ERR) {
      GpibError("ibrd Error");	
   }

   Buffer[Ibcnt()] = '\0';         /* Null terminate the ASCII string         */

   printf("Response from instrument: %s\n", Buffer);        /* Print the device identification         */
	
	
/*****************************************************************************
 * Cleanup - Done only once at the end of your application.
 *****************************************************************************/

   RetVal = ibonl(Device, 0);              /* Take the device offline                 */
   if (RetVal & ERR) {
      GpibError("ibonl Error");	
   }

   return 0;
}


/*****************************************************************************
 *                      Function GPIBERROR
 * This function will notify you that a NI-488 function failed by
 * printing an error message.  The status variable IBSTA will also be
 * printed in hexadecimal along with the mnemonic meaning of the bit
 * position. The status variable IBERR will be printed in decimal
 * along with the mnemonic meaning of the decimal value.  The status
 * variable IBCNTL will be printed in decimal.
 *
 * The NI-488 function IBONL is called to disable the hardware and
 * software.
 *
 * The EXIT function will terminate this program.
 *****************************************************************************/
void GpibError(char *msg) {
    unsigned int Status = Ibsta();
    unsigned int Error = Iberr();
    unsigned int Count = Ibcnt();

    printf ("%s\n", msg);

    printf ("ibsta = &H%x  <", Status);
    if (Status & ERR )  printf (" ERR");
    if (Status & TIMO)  printf (" TIMO");
    if (Status & END )  printf (" END");
    if (Status & SRQI)  printf (" SRQI");
    if (Status & RQS )  printf (" RQS");
    if (Status & CMPL)  printf (" CMPL");
    if (Status & LOK )  printf (" LOK");
    if (Status & REM )  printf (" REM");
    if (Status & CIC )  printf (" CIC");
    if (Status & ATN )  printf (" ATN");
    if (Status & TACS)  printf (" TACS");
    if (Status & LACS)  printf (" LACS");
    if (Status & DTAS)  printf (" DTAS");
    if (Status & DCAS)  printf (" DCAS");
    printf (" >\n");

    printf ("iberr = %d", Error);
    if (Error == EDVR) printf (" EDVR <Driver error>\n");
    if (Error == ECIC) printf (" ECIC <Not Controller-In-Charge>\n");
    if (Error == ENOL) printf (" ENOL <No Listener>\n");
    if (Error == EADR) printf (" EADR <Address error>\n");
    if (Error == EARG) printf (" EARG <Invalid argument>\n");
    if (Error == ESAC) printf (" ESAC <Not System Controller>\n");
    if (Error == EABO) printf (" EABO <Operation aborted>\n");
    if (Error == ENEB) printf (" ENEB <No GPIB board>\n");
    if (Error == EDMA) printf (" EDMA <DMA error>\n");   
    if (Error == EOIP) printf (" EOIP <Async I/O in progress>\n");
    if (Error == ECAP) printf (" ECAP <No capability>\n");
    if (Error == EFSO) printf (" EFSO <File system error>\n");
    if (Error == EBUS) printf (" EBUS <Command error>\n");
    if (Error == ESRQ) printf (" ESRQ <SRQ stuck on>\n");
    if (Error == ETAB) printf (" ETAB <Table Overflow>\n");
    if (Error == ELCK) printf (" ELCK <Interface is locked>\n");
    if (Error == EARM) printf (" EARM <ibnotify callback failed to rearm>\n");
    if (Error == EHDL) printf (" EHDL <Input handle is invalid>\n");
    if (Error == EWIP) printf (" EWIP <Wait in progress on specified input handle>\n");
    if (Error == ERST) printf (" ERST <The event notification was cancelled due to a reset of the interface>\n");
    if (Error == EPWR) printf (" EPWR <The interface lost power>\n");
    
    printf ("ibcnt = %u\n", Count);
    printf ("\n");

    /* Call ibonl to take the device and interface offline */
    ibonl (Device, 0);

    exit(1);
}
