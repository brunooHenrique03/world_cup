unit USelecoes;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Data.DB, Vcl.Grids, Vcl.DBGrids,
  Vcl.ExtCtrls, Vcl.StdCtrls;

type
  TFrmListagemSelecoes = class(TForm)
    Panel1: TPanel;
    Panel2: TPanel;
    DBGrid1: TDBGrid;
    Label1: TLabel;
    Edit1: TEdit;
    procedure FormShow(Sender: TObject);
    procedure Edit1Change(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

var
  FrmListagemSelecoes: TFrmListagemSelecoes;

implementation

{$R *.dfm}

uses UdmPrincipal;

procedure TFrmListagemSelecoes.Edit1Change(Sender: TObject);
begin
  dmPrincipal.qry_Times.Close;
  dmPrincipal.qry_Times.SQL.Clear;
  dmPrincipal.qry_Times.SQL.Add( 'Select * from TTIMES a where SELECAO LIKE ' + QuotedStr(Trim(Edit1.Text) + '%') + ' order by a.SELECAO'  );
  dmPrincipal.qry_Times.Open();
end;

procedure TFrmListagemSelecoes.FormShow(Sender: TObject);
begin
  Edit1Change(Edit1);
end;

end.
