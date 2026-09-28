#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <fstream>
#include <iomanip>
using namespace std;

int G_AND(int a,int b){return a&b;}
int G_OR (int a,int b){return a|b;}
int G_NOT(int a){return a?0:1;}
int G_XOR(int a,int b){return a^b;}
int G_NAND(int a,int b){return 1-(a&b);}
int G_NOR (int a,int b){return 1-(a|b);}
int G_XNOR(int a,int b){return 1-(a^b);}

struct DFF {
    int q, pc;
    DFF():q(0),pc(0){}
    DFF(int v):q(v&1),pc(0){}
    int tick(int d,int c){
        if(c && !pc) q = d&1;
        pc = c&1;
        return q;
    }
};

struct AddResult { int s[8]; int co; };

AddResult gateAdd8(int a,int b,int cin){
    AddResult r;
    int c = cin;
    for(int i=0;i<8;i++){
        int ai = (a>>i)&1;
        int bi = (b>>i)&1;
        int x  = G_XOR(ai,bi);
        r.s[i] = G_XOR(x,c);
        int g1 = G_AND(ai,bi);
        int g2 = G_AND(x,c);
        c = G_OR(g1,g2);
    }
    r.co = c;
    return r;
}

int gateSub8(int a,int b){
    int nb = 0;
    for(int i=0;i<8;i++) if(!((b>>i)&1)) nb |= (1<<i);
    AddResult r = gateAdd8(a,nb,1);
    int v = 0;
    for(int i=0;i<8;i++) if(r.s[i]) v |= (1<<i);
    return v;
}

int gateMuxBit(int a,int b,int sel){
    int x = G_AND(a,sel);
    int y = G_AND(b,G_NOT(sel));
    return G_OR(x,y);
}

struct CPU {
    int RAM[64];
    int SCR[16];
    DFF pc[6];
    DFF acc[8];
    DFF ir[8];
    DFF halt;
    DFF phase;
    DFF delayReg[8];
    int clk;

    CPU(){
        for(int i=0;i<64;i++) RAM[i]=0;
        for(int i=0;i<16;i++) SCR[i]=0;
        for(int i=0;i<6;i++) pc[i]=DFF(0);
        for(int i=0;i<8;i++) acc[i]=DFF(0);
        for(int i=0;i<8;i++) ir[i]=DFF(0);
        for(int i=0;i<8;i++) delayReg[i]=DFF(0);
        clk=0;
    }

    int pcVal(){int v=0;for(int i=0;i<6;i++) if(pc[i].q) v|=(1<<i);return v;}
    int accVal(){int v=0;for(int i=0;i<8;i++) if(acc[i].q) v|=(1<<i);return v;}
    int irVal(){int v=0;for(int i=0;i<8;i++) if(ir[i].q) v|=(1<<i);return v;}
    int delayVal(){int v=0;for(int i=0;i<8;i++) if(delayReg[i].q) v|=(1<<i);return v;}

    void setPC(int v){for(int i=0;i<6;i++) pc[i].q=(v>>i)&1;}
    void setACC(int v){for(int i=0;i<8;i++) acc[i].q=(v>>i)&1;}
    void setIR(int v){for(int i=0;i<8;i++) ir[i].q=(v>>i)&1;}
    void setDelay(int v){for(int i=0;i<8;i++) delayReg[i].q=(v>>i)&1;}

    void decode(){
    }

    void clockTick(){
        clk = G_NOT(clk);
        if(!clk) return;

        int curPhase = phase.q;
        phase.tick(G_NOT(curPhase),1);

        if(curPhase==0){
            if(!halt.q){
                int p = pcVal();
                int instr = RAM[p & 0x3F];
                setIR(instr);
                int nextP = (p + 1) & 0x3F;
                int carry = 1;
                int np = 0;
                for(int i=0;i<6;i++){
                    int b = (p>>i)&1;
                    int s = G_XOR(b,carry);
                    int c = G_AND(b,carry);
                    if(s) np |= (1<<i);
                    carry = c;
                }
                setPC(np & 0x3F);
            }
        } else {
            if(!halt.q){
                int instr = irVal();
                int arg = instr & 0x1F;
                int o0 = (instr>>5)&1;
                int o1 = (instr>>6)&1;
                int o2 = (instr>>7)&1;
                int no0 = G_NOT(o0);
                int no1 = G_NOT(o1);
                int no2 = G_NOT(o2);

                int isLOAD  = G_AND(G_AND(no2,no1), o0);
                int isSTORE = G_AND(G_AND(no2, o1), no0);
                int isADD   = G_AND(G_AND(no2, o1), o0);
                int isSUB   = G_AND(G_AND(o2, no1), no0);
                int isJMP   = G_AND(G_AND(o2, no1), o0);
                int isJZ    = G_AND(G_AND(o2, o1), no0);
                int isOUT   = G_AND(G_AND(o2, o1), o0);
                int isWAIT  = 0;

                int curACC = accVal();
                int ramVal = RAM[arg];

                AddResult addR = gateAdd8(curACC,ramVal,0);
                int addV = 0;
                for(int i=0;i<8;i++) if(addR.s[i]) addV |= (1<<i);
                int subV = gateSub8(curACC,ramVal);

                int anyOp = G_OR(G_OR(isLOAD,isADD),isSUB);
                int nAnyOp = G_NOT(anyOp);

                int newACC = 0;
                for(int i=0;i<8;i++){
                    int lb = (ramVal>>i)&1;
                    int ab = (addV>>i)&1;
                    int sb = (subV>>i)&1;
                    int cb = (curACC>>i)&1;
                    int b1 = G_AND(lb,isLOAD);
                    int b2 = G_AND(ab,isADD);
                    int b3 = G_AND(sb,isSUB);
                    int b4 = G_AND(cb,nAnyOp);
                    int b  = G_OR(G_OR(b1,b2),G_OR(b3,b4));
                    if(b) newACC |= (1<<i);
                }
                setACC(newACC);

                if(isSTORE) RAM[arg] = curACC;

                if(isOUT){
                    if(arg >= 16 && arg <= 30){
                        int a16 = arg & 15;
                        SCR[a16] = curACC;
                    } else if(arg == 31){
                        halt.q = 1;
                    } else {
                        SCR[arg] = curACC;
                    }
                }

                int accZero = 1;
                for(int i=0;i<8;i++) accZero = G_AND(accZero, G_NOT((newACC>>i)&1));

                int doJump = G_OR(isJMP, G_AND(isJZ,accZero));
                if(doJump){
                    setPC(arg & 0x3F);
                }
            }
        }
    }
};

string trim(const string& s){
    size_t a = s.find_first_not_of(" \t\r\n");
    if(a==string::npos) return "";
    size_t b = s.find_last_not_of(" \t\r\n");
    return s.substr(a, b-a+1);
}

struct Assembler {
    int bytes[64];
    Assembler(){ for(int i=0;i<64;i++) bytes[i]=0; }

    bool assemble(const string& src){
        istringstream iss(src);
        string line;
        int addr = 0;
        while(getline(iss,line)){
            size_t h = line.find('#');
            if(h != string::npos) line = line.substr(0,h);
            line = trim(line);
            if(line.empty()) continue;
            istringstream ls(line);
            string tok;
            ls >> tok;

            if(tok=="halt"){
                if(addr>=64){ cout<<"ERR: program too long\n"; return false; }
                bytes[addr++] = (7<<5)|31;
            } else if(tok=="nop"){
                if(addr>=64){ cout<<"ERR: program too long\n"; return false; }
                bytes[addr++] = 0;
            } else if(tok=="load" || tok=="store" || tok=="add" || tok=="sub"){
                int arg; ls >> arg;
                int op = (tok=="load")?1:(tok=="store")?2:(tok=="add")?3:4;
                if(addr>=64){ cout<<"ERR: program too long\n"; return false; }
                bytes[addr++] = (op<<5) | (arg & 0x1F);
            } else if(tok=="jmp" || tok=="jz"){
                int arg; ls >> arg;
                int op = (tok=="jmp")?5:6;
                if(addr>=64){ cout<<"ERR: program too long\n"; return false; }
                bytes[addr++] = (op<<5) | (arg & 0x3F);
            } else if(tok=="out"){
                int arg; ls >> arg;
                if(addr>=64){ cout<<"ERR: program too long\n"; return false; }
                bytes[addr++] = (7<<5) | (arg & 0x1F);
            } else if(tok=="set"){
                int a,v; ls >> a >> v;
                if(a<0||a>=64){ cout<<"ERR: set addr out of range\n"; return false; }
                bytes[a] = v & 0xFF;
            } else if(tok=="write"){
                string rest; getline(ls,rest);
                size_t q1 = rest.find('"');
                size_t q2 = rest.find('"',q1+1);
                if(q1==string::npos||q2==string::npos){
                    cout<<"ERR: write needs \"text\"\n";
                    return false;
                }
                string text = rest.substr(q1+1, q2-q1-1);
                int target = 0;
                istringstream ts(rest.substr(q2+1));
                ts >> target;
                for(size_t i=0;i<text.size();i++){
                    if(target + (int)i >= 64) break;
                    bytes[target+i] = (unsigned char)text[i];
                }
            } else {
                cout << "ERR: unknown command '" << tok << "'\n";
                return false;
            }
        }
        return true;
    }
};

void showScreen(CPU& cpu){
    cout << "\n+----------------+";
    cout << "\n|";
    for(int i=0;i<16;i++){
        int v = cpu.SCR[i];
        char c = (v>=32 && v<127) ? (char)v : '.';
        cout << c;
    }
    cout << "|";
    cout << "\n+----------------+\n";
}

void showRAM(CPU& cpu,int a,int n){
    cout << "\nRAM[" << a << ".." << a+n-1 << "]:\n";
    for(int i=0;i<n;i++){
        int ad = a+i;
        if(ad >= 64) break;
        int v = cpu.RAM[ad];
        cout << "  [" << setw(2) << ad << "] " << setw(3) << v << "  ";
        for(int b=7;b>=0;b--) cout << ((v>>b)&1);
        cout << "\n";
    }
}

void showState(CPU& cpu){
    cout << "\n=== CPU STATE ===\n";
    cout << "PC   = " << cpu.pcVal() << "\n";
    cout << "ACC  = " << cpu.accVal() << " (0x" << hex << cpu.accVal() << dec << ")\n";
    cout << "IR   = " << cpu.irVal() << "\n";
    cout << "HALT = " << cpu.halt.q << "\n";
}

void showHelp(){
    cout << "\n=== STYLEBYTE COMPUTER (pure logic gates) ===\n";
    cout << "Perintah:\n";
    cout << "  src           - masuk mode tulis program (akhiri dengan '.')\n";
    cout << "  load FILE     - muat program dari file\n";
    cout << "  run           - jalankan sampai HALT\n";
    cout << "  step N        - N siklus clock\n";
    cout << "  screen        - tampilkan text display\n";
    cout << "  state         - tampilkan state CPU\n";
    cout << "  ram A N       - tampilkan N byte RAM mulai dari A\n";
    cout << "  reset         - reset CPU dan RAM\n";
    cout << "  help          - tampilkan bantuan\n";
    cout << "  quit          - keluar\n";
    cout << "\nBahasa stylebyte v0.1:\n";
    cout << "  set A V          RAM[A] = V (compile-time)\n";
    cout << "  load A           ACC = RAM[A]\n";
    cout << "  store A          RAM[A] = ACC\n";
    cout << "  add A            ACC += RAM[A]\n";
    cout << "  sub A            ACC -= RAM[A]\n";
    cout << "  jmp A            PC = A\n";
    cout << "  jz A             PC = A kalau ACC == 0\n";
    cout << "  out A            screen[A&15] = ACC; A=31 halt\n";
    cout << "  halt             stop\n";
    cout << "  write \"txt\" A    tulis string di RAM mulai alamat A\n";
    cout << "\nContoh program:\n";
    cout << "  set 32 72\n";
    cout << "  set 33 73\n";
    cout << "  load 32\n";
    cout << "  out 0\n";
    cout << "  load 33\n";
    cout << "  out 1\n";
    cout << "  halt\n";
}

int main(){
    CPU cpu;
    Assembler asm_;
    string cmd;

    showHelp();

    while(true){
        cout << "\n> ";
        if(!getline(cin,cmd)) break;
        istringstream ss(cmd);
        string tok;
        ss >> tok;
        if(tok.empty()) continue;

        if(tok=="help"){ showHelp(); }
        else if(tok=="quit" || tok=="exit"){ break; }
        else if(tok=="reset"){
            cpu = CPU();
            cout << "reset.\n";
        }
        else if(tok=="src"){
            cout << "(ketik program, akhiri dengan '.'):\n";
            string line, src;
            while(getline(cin,line)){
                if(trim(line) == ".") break;
                src += line + "\n";
            }
            asm_ = Assembler();
            if(asm_.assemble(src)){
                for(int i=0;i<64;i++) cpu.RAM[i] = asm_.bytes[i];
                cpu.setPC(0);
                cpu.setACC(0);
                cpu.setIR(0);
                cpu.halt.q = 0;
                cpu.phase.q = 0;
                cout << "program dimuat.\n";
                showRAM(cpu,0,16);
            }
        }
        else if(tok=="load"){
            string fn;
            ss >> fn;
            ifstream f(fn.c_str());
            if(!f){ cout << "tidak bisa buka " << fn << "\n"; continue; }
            string src((istreambuf_iterator<char>(f)), istreambuf_iterator<char>());
            asm_ = Assembler();
            if(asm_.assemble(src)){
                for(int i=0;i<64;i++) cpu.RAM[i] = asm_.bytes[i];
                cpu.setPC(0);
                cpu.setACC(0);
                cpu.setIR(0);
                cpu.halt.q = 0;
                cpu.phase.q = 0;
                cout << "program dimuat dari " << fn << "\n";
            }
        }
        else if(tok=="run"){
            int cycles = 0;
            while(!cpu.halt.q && cycles < 200000){
                cpu.clockTick();
                cpu.clockTick();
                cycles++;
            }
            cout << "selesai setelah " << cycles << " siklus.\n";
            showState(cpu);
            showScreen(cpu);
        }
        else if(tok=="step"){
            int n = 1;
            ss >> n;
            for(int i=0;i<n && !cpu.halt.q;i++){
                cpu.clockTick();
                cpu.clockTick();
            }
            showState(cpu);
            showScreen(cpu);
        }
        else if(tok=="screen"){ showScreen(cpu); }
        else if(tok=="state"){ showState(cpu); }
        else if(tok=="ram"){
            int a=0,n=16;
            ss >> a >> n;
            showRAM(cpu,a,n);
        }
        else{
            cout << "perintah tidak dikenal. coba 'help'\n";
        }
    }
    cout << "bye.\n";
    return 0;
}
