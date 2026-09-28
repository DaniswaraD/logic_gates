#include <windows.h>
#include <string>
#include <vector>
using namespace std;

static inline int gAND(int a,int b){return a&b;}
static inline int gOR (int a,int b){return a|b;}
static inline int gNOT(int a){return a?0:1;}
static inline int gXOR(int a,int b){return a^b;}

struct Gate { int type; int x,y; int a,b,q; };
struct Sw   { int x,y,w,h,val,isBtn; const wchar_t* label; };
struct Led  { int x,y,r,val; COLORREF on; const wchar_t* label; };

vector<Gate> G;
vector<Sw>   S;
vector<Led>  L;

int g_dataSw[4] = {0};
int g_addrSw[3] = {0};
int g_sub = 0;
int g_wr = 0, g_clr = 0, g_osc = 0;
int g_ram[8][4] = {{0}};
int g_tick = 0;
HWND hMain = NULL;

void buildCircuit(){
    G.clear(); S.clear(); L.clear();

    for(int i=0;i<4;i++){ Gate g={3, 160+i*180, 190, 0,0,0}; G.push_back(g); }
    for(int bit=0; bit<4; bit++){
        int x = 160 + bit*180;
        G.push_back({3, x, 300, 0,0,0});
        G.push_back({3, x, 380, 0,0,0});
        G.push_back({0, x, 460, 0,0,0});
        G.push_back({0, x, 540, 0,0,0});
        G.push_back({1, x, 620, 0,0,0});
    }

    for(int i=0;i<4;i++){ Led l={90+i*50, 100, 14, 0, RGB(80,140,255), L""}; L.push_back(l); }
    for(int i=0;i<4;i++){ Led l={160+i*180+25, 720, 16, 0, RGB(0,200,0), L""}; L.push_back(l); }

    for(int i=0;i<4;i++){
        wchar_t* lb = new wchar_t[4];
        wsprintfW(lb, L"D%d", 3-i);
        Sw s={90+i*50, 20, 40, 50, 0, 0, lb};
        S.push_back(s);
    }
    for(int i=0;i<3;i++){
        wchar_t* lb = new wchar_t[4];
        wsprintfW(lb, L"A%d", 2-i);
        Sw s={400+i*50, 20, 40, 50, 0, 0, lb};
        S.push_back(s);
    }
    {
        Sw s={600, 20, 60, 50, 0, 0, L"SUB"};
        S.push_back(s);
    }
    {
        Sw s={700, 20, 60, 50, 0, 0, L"WR"};
        S.push_back(s);
    }
    {
        Sw s={780, 20, 60, 50, 0, 0, L"CLR"};
        S.push_back(s);
    }
    {
        Sw s={860, 20, 60, 50, 0, 0, L"OSC"};
        S.push_back(s);
    }
}

void simulate(){
    int addr = g_addrSw[0] | (g_addrSw[1]<<1) | (g_addrSw[2]<<2);
    if(addr>7) addr=7;

    for(int i=0;i<4;i++){
        G[i].a = g_ram[addr][i];
        G[i].b = g_sub;
        G[i].q = gXOR(G[i].a, G[i].b);
    }

    int cin = g_sub;
    int result[4];
    for(int bit=0; bit<4; bit++){
        int base = 4 + bit*5;
        G[base].a   = g_dataSw[bit];
        G[base].b   = G[bit].q;
        G[base].q   = gXOR(G[base].a, G[base].b);
        int x = G[base].q;

        G[base+1].a = x;
        G[base+1].b = cin;
        G[base+1].q = gXOR(G[base+1].a, G[base+1].b);
        result[bit] = G[base+1].q;

        G[base+2].a = g_dataSw[bit];
        G[base+2].b = G[bit].q;
        G[base+2].q = gAND(G[base+2].a, G[base+2].b);
        int g1 = G[base+2].q;

        G[base+3].a = x;
        G[base+3].b = cin;
        G[base+3].q = gAND(G[base+3].a, G[base+3].b);
        int g2 = G[base+3].q;

        G[base+4].a = g1;
        G[base+4].b = g2;
        G[base+4].q = gOR(G[base+4].a, G[base+4].b);
        cin = G[base+4].q;
    }

    for(int i=0;i<4;i++) L[i].val = g_dataSw[i];
    for(int i=0;i<4;i++) L[4+i].val = result[i];

    static int wrPrev = 0;
    if(g_wr && !wrPrev){
        for(int i=0;i<4;i++) g_ram[addr][i] = result[i];
    }
    wrPrev = g_wr;

    static int clrPrev = 0;
    if(g_clr && !clrPrev){
        for(int r=0;r<8;r++) for(int b=0;b<4;b++) g_ram[r][b]=0;
    }
    clrPrev = g_clr;
}

void drawGate(HDC hdc, Gate& g){
    int x=g.x, y=g.y, w=50, h=40;
    HBRUSH br = CreateSolidBrush(g.q ? RGB(190,250,190) : RGB(255,255,255));
    HPEN pen  = CreatePen(PS_SOLID, 2, RGB(30,30,30));
    HGDIOBJ ob = SelectObject(hdc, br);
    HGDIOBJ op = SelectObject(hdc, pen);

    if(g.type==0){
        POINT p[] = {{x,y},{x+w/2,y},{x+w,y+h/2},{x+w/2,y+h},{x,y+h},{x,y}};
        Polyline(hdc, p, 6);
    } else if(g.type==1){
        POINT p[] = {{x,y},{x+w/3,y},{x+w,y+h/2},{x+w/3,y+h},{x,y+h},{x+w/3,y+h/2},{x,y}};
        Polyline(hdc, p, 7);
    } else if(g.type==2){
        POINT p[] = {{x,y},{x+w,y+h/2},{x,y+h},{x,y}};
        Polyline(hdc, p, 4);
        Ellipse(hdc, x+w, y+h/2-5, x+w+10, y+h/2+5);
    } else {
        POINT p[] = {{x+8,y},{x+8+w/3,y},{x+8+w,y+h/2},{x+8+w/3,y+h},{x+8,y+h},{x+8+w/3,y+h/2},{x+8,y}};
        Polyline(hdc, p, 7);
        POINT p2[] = {{x,y},{x,y+h}};
        Polyline(hdc, p2, 2);
    }

    MoveToEx(hdc, x-10, y+12, NULL); LineTo(hdc, x, y+12);
    if(g.type!=2){ MoveToEx(hdc, x-10, y+h-12, NULL); LineTo(hdc, x, y+h-12); }
    int ox = (g.type==2) ? x+w+10 : x+w;
    MoveToEx(hdc, ox, y+h/2, NULL); LineTo(hdc, ox+10, y+h/2);

    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(30,30,30));
    const char* lbl = (g.type==0)?"AND":(g.type==1)?"OR":(g.type==2)?"NOT":"XOR";
    TextOutA(hdc, x+6, y+h/2-7, lbl, 3);

    SelectObject(hdc, ob); SelectObject(hdc, op);
    DeleteObject(br); DeleteObject(pen);
}

void drawSw(HDC hdc, Sw& s){
    HBRUSH br = CreateSolidBrush(RGB(180,180,180));
    HPEN pen  = CreatePen(PS_SOLID, 2, RGB(30,30,30));
    HGDIOBJ ob = SelectObject(hdc, br);
    HGDIOBJ op = SelectObject(hdc, pen);
    Rectangle(hdc, s.x, s.y, s.x+s.w, s.y+s.h);
    int ky = s.val ? s.y+4 : s.y+s.h-24;
    HBRUSH br2 = CreateSolidBrush(RGB(255,255,255));
    SelectObject(hdc, br2);
    Rectangle(hdc, s.x+6, ky, s.x+s.w-6, ky+20);
    DeleteObject(br2);
    if(s.label){
        SetBkMode(hdc, TRANSPARENT);
        SetTextColor(hdc, RGB(30,30,30));
        TextOutW(hdc, s.x+s.w/2-12, s.y+s.h+4, s.label, wcslen(s.label));
    }
    SelectObject(hdc, ob); SelectObject(hdc, op);
    DeleteObject(br); DeleteObject(pen);
}

void drawLed(HDC hdc, Led& l){
    HBRUSH br = CreateSolidBrush(l.val ? l.on : RGB(230,230,230));
    HPEN pen  = CreatePen(PS_SOLID, 2, RGB(30,30,30));
    HGDIOBJ ob = SelectObject(hdc, br);
    HGDIOBJ op = SelectObject(hdc, pen);
    Ellipse(hdc, l.x-l.r, l.y-l.r, l.x+l.r, l.y+l.r);
    if(l.label && l.label[0]){
        SetBkMode(hdc, TRANSPARENT);
        SetTextColor(hdc, RGB(30,30,30));
        TextOutW(hdc, l.x-10, l.y+l.r+2, l.label, wcslen(l.label));
    }
    SelectObject(hdc, ob); SelectObject(hdc, op);
    DeleteObject(br); DeleteObject(pen);
}

void drawWires(HDC hdc){
    HPEN pen  = CreatePen(PS_SOLID, 2, RGB(120,120,120));
    HPEN penHi= CreatePen(PS_SOLID, 3, RGB(10,10,10));
    HGDIOBJ op = SelectObject(hdc, pen);

    for(int bit=0; bit<4; bit++){
        int xr = 160 + bit*180 + 25;
        int xt = 160 + bit*180 + 25;
        // bx gate output down to FA XOR
        if(G[bit].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+25, 210, NULL);
        LineTo(hdc, xr+25, 240);
        LineTo(hdc, xt+10, 240);
        LineTo(hdc, xt+10, 300);

        int base = 4 + bit*5;
        // x -> sum XOR
        if(G[base].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+35, 320, NULL);
        LineTo(hdc, xr+35, 360);
        LineTo(hdc, xt+10, 360);
        LineTo(hdc, xt+10, 380);

        // x -> AND g2
        if(G[base].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+35, 320, NULL);
        LineTo(hdc, xr+50, 320);
        LineTo(hdc, xr+50, 520);
        LineTo(hdc, xt+10, 520);
        LineTo(hdc, xt+10, 540);

        // g1 -> OR
        if(G[base+2].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+35, 480, NULL);
        LineTo(hdc, xr+35, 600);
        LineTo(hdc, xt+10, 600);
        LineTo(hdc, xt+10, 620);

        // g2 -> OR
        if(G[base+3].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+35, 560, NULL);
        LineTo(hdc, xr+45, 560);
        LineTo(hdc, xr+45, 640);
        LineTo(hdc, xt+10, 640);
        LineTo(hdc, xt+10, 620);

        // sum -> LED
        if(G[base+1].q) SelectObject(hdc, penHi); else SelectObject(hdc, pen);
        MoveToEx(hdc, xr+35, 400, NULL);
        LineTo(hdc, xr+35, 700);
    }

    // OR output (cout) -> next FA cin (skip for simplicity, it's implicit)
    SelectObject(hdc, op);
    DeleteObject(pen); DeleteObject(penHi);
}

void drawRam(HDC hdc){
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(30,30,30));
    TextOutA(hdc, 30, 760, "RAM  8 bytes x 4 bits", 21);
    for(int row=0; row<8; row++){
        int y = 790 + row*22;
        char buf[16];
        wsprintfA(buf, "[%d]", row);
        TextOutA(hdc, 30, y+2, buf, 3);
        for(int b=3; b>=0; b--){
            int x = 90 + (3-b)*30;
            HBRUSH br = CreateSolidBrush(g_ram[row][b] ? RGB(200,60,60) : RGB(230,230,230));
            HPEN pen  = CreatePen(PS_SOLID, 2, RGB(30,30,30));
            HGDIOBJ ob = SelectObject(hdc, br);
            HGDIOBJ op = SelectObject(hdc, pen);
            Ellipse(hdc, x, y, x+18, y+18);
            SelectObject(hdc, ob); SelectObject(hdc, op);
            DeleteObject(br); DeleteObject(pen);
        }
    }
}

void drawAll(HDC hdc){
    RECT r;
    GetClientRect(hMain, &r);
    HBRUSH bg = CreateSolidBrush(RGB(250,250,250));
    FillRect(hdc, &r, bg);
    DeleteObject(bg);

    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, RGB(30,30,30));
    TextOutA(hdc, 90, 4, "DATA", 4);
    TextOutA(hdc, 400, 4, "ADDR", 4);
    TextOutA(hdc, 600, 4, "MODE", 4);
    TextOutA(hdc, 700, 4, "WRITE", 5);
    TextOutA(hdc, 780, 4, "CLEAR", 5);
    TextOutA(hdc, 860, 4, "OSC", 3);

    for(size_t i=0;i<S.size();i++) drawSw(hdc, S[i]);
    drawWires(hdc);
    for(size_t i=0;i<G.size();i++) drawGate(hdc, G[i]);
    for(size_t i=0;i<L.size();i++) drawLed(hdc, L[i]);
    drawRam(hdc);

    SetTextColor(hdc, RGB(90,90,90));
    TextOutA(hdc, 30, 660, "RESULT ->", 9);

    SetTextColor(hdc, RGB(30,30,30));
    if(g_sub) TextOutA(hdc, 900, 40, "MODE: SUB", 9);
    else      TextOutA(hdc, 900, 40, "MODE: ADD", 9);
    if(g_osc) TextOutA(hdc, 900, 60, "OSC: ON", 7);
    else      TextOutA(hdc, 900, 60, "OSC: OFF", 8);
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp){
    switch(msg){
        case WM_CREATE:
            SetTimer(hwnd, 1, 120, NULL);
            return 0;
        case WM_TIMER:
            if(g_osc){
                g_tick = !g_tick;
                simulate();
                InvalidateRect(hwnd, NULL, FALSE);
            }
            return 0;
        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);
            drawAll(hdc);
            EndPaint(hwnd, &ps);
            return 0;
        }
        case WM_LBUTTONDOWN: {
            int mx = LOWORD(lp);
            int my = HIWORD(lp);
            for(size_t i=0;i<S.size();i++){
                Sw& s = S[i];
                if(mx>=s.x && mx<=s.x+s.w && my>=s.y && my<=s.y+s.h){
                    s.val = s.val ? 0 : 1;
                    if(i<4)       g_dataSw[i]  = s.val;
                    else if(i<7)  g_addrSw[i-4]= s.val;
                    else if(i==7) g_sub        = s.val;
                    else if(i==8) g_wr         = s.val;
                    else if(i==9) g_clr        = s.val;
                    else if(i==10)g_osc        = s.val;
                    simulate();
                    InvalidateRect(hwnd, NULL, FALSE);
                    break;
                }
            }
            return 0;
        }
        case WM_DESTROY:
            KillTimer(hwnd, 1);
            PostQuitMessage(0);
            return 0;
    }
    return DefWindowProc(hwnd, msg, wp, lp);
}

int WINAPI WinMain(HINSTANCE hi, HINSTANCE hp, LPSTR cmd, int show){
    buildCircuit();
    simulate();

    WNDCLASSA wc = {0};
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hi;
    wc.hCursor       = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW+1);
    wc.lpszClassName = "StylebyteLab";
    RegisterClassA(&wc);

    hMain = CreateWindowA("StylebyteLab",
        "Stylebyte Computer - Pure Logic Gates",
        WS_OVERLAPPEDWINDOW,
        100, 100, 1050, 1050,
        NULL, NULL, hi, NULL);
    ShowWindow(hMain, show);
    UpdateWindow(hMain);

    MSG msg;
    while(GetMessage(&msg, NULL, 0, 0)){
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    return 0;
}
